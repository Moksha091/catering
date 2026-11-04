import { SupabaseClient } from "@supabase/supabase-js";
import { CreateBusinessInput, createBusinessSchema } from "@/lib/validation/business";
import { assertBusinessMembership, UnauthorizedError } from "@/server/policies/tenant.policy";
import { Business } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/server";

export class BusinessService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Check if a slug is available for a new or existing business
   */
  async isSlugAvailable(slug: string, currentBusinessId?: string): Promise<boolean> {
    let query = this.supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug.toLowerCase().trim());

    if (currentBusinessId) {
      query = query.neq("id", currentBusinessId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data?.length ?? 0) === 0;
  }

  /**
   * Create a new business and assign the creator as 'owner' member
   */
  async createBusiness(input: CreateBusinessInput): Promise<Business> {
    const validated = createBusinessSchema.parse(input);

    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError("You must be logged in to create a business");
    }

    const slugAvailable = await this.isSlugAvailable(validated.slug);
    if (!slugAvailable) {
      throw new Error(`The URL handle "${validated.slug}" is already taken.`);
    }

    // Ensure profile row exists before inserting business (FK: businesses.owner_id -> profiles.id).
    // Strategy 1: Direct upsert using user's authenticated client (allowed by RLS: auth.uid() = id).
    // Strategy 2: Call ensure_own_profile RPC (SECURITY DEFINER, if migration 5 was applied).
    // Strategy 3: Admin client (if service role key is present in environment).
    const profileName = (user.user_metadata?.full_name as string) || validated.name;
    const profilePhone = (user.user_metadata?.phone as string) || validated.phone || null;

    const { error: directError } = await this.supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: profileName,
          phone: profilePhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (directError) {
      console.warn("[business.service] Direct profile upsert:", directError.message, "— trying RPC");
      const { error: rpcError } = await this.supabase.rpc("ensure_own_profile", {
        p_full_name: profileName,
        p_phone: profilePhone,
      });

      if (rpcError) {
        console.warn("[business.service] RPC also failed:", rpcError.message, "— trying admin fallback");
        try {
          const admin = createAdminClient();
          await admin.from("profiles").upsert(
            { id: user.id, full_name: profileName, phone: profilePhone },
            { onConflict: "id", ignoreDuplicates: false }
          );
        } catch {
          // If all 3 paths fail, do not crash here. Proceed to business insert:
          // if profile already exists in DB, business insert will succeed!
        }
      }
    }

    // 1. Insert business
    const { data: business, error: businessError } = await this.supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: validated.name,
        slug: validated.slug.toLowerCase(),
        description: validated.description || null,
        phone: validated.phone,
        whatsapp_phone: validated.whatsappPhone,
        city: validated.city,
        state: validated.state || null,
        address_text: validated.addressText || null,
        published: true,
        status: "active",
      })
      .select()
      .single();

    if (businessError || !business) {
      throw new Error(businessError?.message || "Failed to create business");
    }

    // 2. Add owner to business_members (guarded so RLS won't block creation)
    const { error: memberError } = await this.supabase
      .from("business_members")
      .insert({
        business_id: business.id,
        user_id: user.id,
        role: "owner",
        status: "active",
      });

    if (memberError) {
      console.warn("[business.service] business_members insert warning:", memberError.message);
      // Trigger on_business_created may have already created it
    }

    return business as Business;
  }

  /**
   * List all businesses where current user is owner or an active member
   */
  async getUserBusinesses(): Promise<Business[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return [];

    // 1. Fetch businesses directly owned by user
    const { data: ownedData, error: ownedError } = await this.supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .eq("status", "active");

    if (ownedError) {
      console.warn("[business.service] Error fetching owned businesses:", ownedError.message);
    }

    // 2. Fetch businesses via membership (for team members / staff)
    const { data: memberData, error: memberError } = await this.supabase
      .from("business_members")
      .select("businesses(*)")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (memberError) {
      console.warn("[business.service] Error fetching member businesses:", memberError.message);
    }

    // Combine and deduplicate
    const combined: Business[] = [...((ownedData || []) as Business[])];
    if (memberData) {
      for (const row of memberData as Array<{ businesses: unknown }>) {
        const b = row.businesses as Business | null;
        if (b && b.id && !combined.some((item) => item.id === b.id)) {
          combined.push(b);
        }
      }
    }

    return combined;
  }

  /**
   * Update business details (guarded by owner permission)
   */
  async updateBusiness(
    businessId: string,
    updates: Partial<CreateBusinessInput>
  ): Promise<Business> {
    await assertBusinessMembership(this.supabase, businessId, "owner");

    const { data, error } = await this.supabase
      .from("businesses")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update business");
    }

    return data as Business;
  }

  /**
   * Toggle storefront publication status
   */
  async setPublished(businessId: string, published: boolean): Promise<Business> {
    await assertBusinessMembership(this.supabase, businessId, "owner");

    const { data, error } = await this.supabase
      .from("businesses")
      .update({
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update publication status");
    }

    return data as Business;
  }
}


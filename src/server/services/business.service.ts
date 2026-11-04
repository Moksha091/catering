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
    // Strategy 1: Call the `ensure_own_profile` RPC — SECURITY DEFINER, no service-role key needed.
    // Strategy 2: Fall back to admin client (service-role) if RPC fails for any reason.
    // This is safe — user.id is verified via auth.getUser() above; RPC enforces auth.uid() == user.id.
    const profileName = (user.user_metadata?.full_name as string) || validated.name;
    const profilePhone = (user.user_metadata?.phone as string) || validated.phone || null;

    const { error: rpcError } = await this.supabase.rpc("ensure_own_profile", {
      p_full_name: profileName,
      p_phone: profilePhone,
    });

    if (rpcError) {
      console.warn("[business.service] ensure_own_profile RPC failed:", rpcError.message, "— trying admin client fallback");
      try {
        const admin = createAdminClient();
        const { error: profileError } = await admin.from("profiles").upsert(
          { id: user.id, full_name: profileName, phone: profilePhone },
          { onConflict: "id", ignoreDuplicates: false }
        );
        if (profileError) {
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }
      } catch (adminErr: unknown) {
        const msg = adminErr instanceof Error ? adminErr.message : String(adminErr);
        // If both paths fail, surface a clear error rather than a cryptic FK violation
        throw new Error(
          `Could not create your account profile. Please sign out and sign back in, then try again. (${msg})`
        );
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

    // 2. Add owner to business_members
    const { error: memberError } = await this.supabase
      .from("business_members")
      .insert({
        business_id: business.id,
        user_id: user.id,
        role: "owner",
        status: "active",
      });

    if (memberError) {
      console.error("Failed to add owner member:", memberError);
      // Even if RLS trigger created it or table policy applies, log cleanly
    }

    return business as Business;
  }

  /**
   * List all businesses where current user is an active member
   */
  async getUserBusinesses(): Promise<Business[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await this.supabase
      .from("business_members")
      .select("businesses(*)")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching user businesses:", error);
      return [];
    }

    // Extract joined business objects
    return (data || [])
      .map((row: { businesses: unknown }) => row.businesses)
      .filter(Boolean) as unknown as Business[];
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


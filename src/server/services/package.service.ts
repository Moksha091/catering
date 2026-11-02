import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreatePackageInput,
  createPackageSchema,
  AddPackageItemInput,
  addPackageItemSchema,
} from "@/lib/validation/package";
import { assertBusinessMembership } from "@/server/policies/tenant.policy";
import { Package, PackageItem } from "@/types/database";
import { rupeesToPaise } from "@/lib/utils";

export interface PackageWithItems extends Package {
  items: PackageItem[];
}

export class PackageService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Create a catering package
   */
  async createPackage(
    businessId: string,
    input: CreatePackageInput
  ): Promise<Package> {
    await assertBusinessMembership(this.supabase, businessId);
    const validated = createPackageSchema.parse(input);

    const pricePaise =
      validated.priceRupees !== undefined && validated.priceRupees !== null
        ? rupeesToPaise(validated.priceRupees)
        : null;

    const { data, error } = await this.supabase
      .from("packages")
      .insert({
        business_id: businessId,
        name: validated.name,
        description: validated.description || null,
        pricing_type: validated.pricingType,
        price_paise: pricePaise,
        minimum_guests: validated.minimumGuests || null,
        maximum_guests: validated.maximumGuests || null,
        is_published: validated.isPublished,
        display_order: 0,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create package");
    }

    return data as Package;
  }

  /**
   * List packages for a business with item inclusions
   */
  async listPackages(businessId: string): Promise<PackageWithItems[]> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data: packages, error: pkgError } = await this.supabase
      .from("packages")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (pkgError) throw pkgError;
    if (!packages || packages.length === 0) return [];

    const packageIds = packages.map((p) => p.id);
    const { data: items, error: itemsError } = await this.supabase
      .from("package_items")
      .select("*")
      .eq("business_id", businessId)
      .in("package_id", packageIds)
      .order("display_order", { ascending: true });

    if (itemsError) throw itemsError;

    const packageItems = (items || []) as PackageItem[];
    return packages.map((pkg) => ({
      ...(pkg as Package),
      items: packageItems.filter((i) => i.package_id === pkg.id),
    }));
  }

  /**
   * Retrieve single package with inclusions
   */
  async getPackageWithInclusions(
    businessId: string,
    packageId: string
  ): Promise<PackageWithItems | null> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data: pkg, error: pkgError } = await this.supabase
      .from("packages")
      .select("*")
      .eq("business_id", businessId)
      .eq("id", packageId)
      .single();

    if (pkgError || !pkg) return null;

    const { data: items, error: itemsError } = await this.supabase
      .from("package_items")
      .select("*")
      .eq("business_id", businessId)
      .eq("package_id", packageId)
      .order("display_order", { ascending: true });

    if (itemsError) throw itemsError;

    return {
      ...(pkg as Package),
      items: (items || []) as PackageItem[],
    };
  }

  /**
   * Add an item inclusion to a package (snapshots the name)
   */
  async addPackageItem(
    businessId: string,
    input: AddPackageItemInput
  ): Promise<PackageItem> {
    await assertBusinessMembership(this.supabase, businessId);
    const validated = addPackageItemSchema.parse(input);

    const { data, error } = await this.supabase
      .from("package_items")
      .insert({
        business_id: businessId,
        package_id: validated.packageId,
        menu_item_id: validated.menuItemId || null,
        item_name_snapshot: validated.itemNameSnapshot,
        quantity_or_description: validated.quantityOrDescription || null,
        display_order: 0,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to add item to package");
    }

    return data as PackageItem;
  }

  /**
   * Remove item from package
   */
  async removePackageItem(
    businessId: string,
    packageItemId: string
  ): Promise<void> {
    await assertBusinessMembership(this.supabase, businessId);

    const { error } = await this.supabase
      .from("package_items")
      .delete()
      .eq("business_id", businessId)
      .eq("id", packageItemId);

    if (error) throw error;
  }

  /**
   * Toggle package published status
   */
  async setPackagePublished(
    businessId: string,
    packageId: string,
    isPublished: boolean
  ): Promise<Package> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("packages")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", packageId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update package status");
    }

    return data as Package;
  }

  /**
   * Duplicate a package with all its item inclusions
   */
  async duplicatePackage(
    businessId: string,
    packageId: string
  ): Promise<Package> {
    const existing = await this.getPackageWithInclusions(businessId, packageId);
    if (!existing) {
      throw new Error("Source package not found");
    }

    const newPkg = await this.createPackage(businessId, {
      name: `${existing.name} (Copy)`,
      description: existing.description || undefined,
      pricingType: existing.pricing_type,
      priceRupees:
        existing.price_paise !== null ? existing.price_paise / 100 : undefined,
      minimumGuests: existing.minimum_guests,
      maximumGuests: existing.maximum_guests,
      isPublished: false,
    });

    for (const item of existing.items) {
      await this.addPackageItem(businessId, {
        packageId: newPkg.id,
        menuItemId: item.menu_item_id,
        itemNameSnapshot: item.item_name_snapshot,
        quantityOrDescription: item.quantity_or_description || undefined,
      });
    }

    return newPkg;
  }
}

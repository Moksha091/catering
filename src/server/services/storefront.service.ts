import { SupabaseClient } from "@supabase/supabase-js";
import {
  Business,
  Menu,
  MenuCategory,
  MenuItem,
  Package,
  PackageItem,
  ServiceArea,
} from "@/types/database";

export interface PublicStorefrontDTO {
  business: Business;
  isPreview?: boolean;
  menus: Array<
    Menu & {
      categories: Array<
        MenuCategory & {
          items: MenuItem[];
        }
      >;
    }
  >;
  packages: Array<
    Package & {
      items: PackageItem[];
    }
  >;
  serviceAreas: ServiceArea[];
}

export class StorefrontService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Retrieves public storefront data by slug.
   * STRICT SECURITY: Only queries published businesses, published menus,
   * available dishes, and published packages.
   */
  async getPublicStorefrontBySlug(
    slug: string
  ): Promise<PublicStorefrontDTO | null> {
    const cleanSlug = slug.toLowerCase().trim();

    // 1. Fetch business
    const { data: business, error: bizError } = await this.supabase
      .from("businesses")
      .select("*")
      .eq("slug", cleanSlug)
      .eq("status", "active")
      .single();

    if (bizError || !business) {
      return null;
    }

    let isPreview = false;
    if (!business.published) {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data: membership } = await this.supabase
        .from("business_members")
        .select("role")
        .eq("business_id", business.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!membership) {
        return null;
      }

      isPreview = true;
    }

    const businessId = business.id;

    // 2. Fetch published menus
    const { data: menus } = await this.supabase
      .from("menus")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "published")
      .order("display_order", { ascending: true });

    const menuList = (menus || []) as Menu[];
    const menuIds = menuList.map((m) => m.id);

    // 3. Fetch categories for published menus
    let categories: MenuCategory[] = [];
    if (menuIds.length > 0) {
      const { data: catData } = await this.supabase
        .from("menu_categories")
        .select("*")
        .eq("business_id", businessId)
        .in("menu_id", menuIds)
        .order("display_order", { ascending: true });
      categories = (catData || []) as MenuCategory[];
    }

    // 4. Fetch available items for published categories
    const categoryIds = categories.map((c) => c.id);
    let items: MenuItem[] = [];
    if (categoryIds.length > 0) {
      const { data: itemData } = await this.supabase
        .from("menu_items")
        .select("*")
        .eq("business_id", businessId)
        .in("category_id", categoryIds)
        .eq("is_available", true)
        .order("display_order", { ascending: true });
      items = (itemData || []) as MenuItem[];
    }

    // 5. Fetch published packages and item inclusions
    const { data: packagesData } = await this.supabase
      .from("packages")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    const packageList = (packagesData || []) as Package[];
    const packageIds = packageList.map((p) => p.id);

    let packageItems: PackageItem[] = [];
    if (packageIds.length > 0) {
      const { data: piData } = await this.supabase
        .from("package_items")
        .select("*")
        .eq("business_id", businessId)
        .in("package_id", packageIds)
        .order("display_order", { ascending: true });
      packageItems = (piData || []) as PackageItem[];
    }

    // 6. Fetch service areas
    const { data: areasData } = await this.supabase
      .from("service_areas")
      .select("*")
      .eq("business_id", businessId);

    // Assemble nested structures
    const assembledMenus = menuList.map((menu) => {
      const menuCats = categories.filter((c) => c.menu_id === menu.id);
      return {
        ...menu,
        categories: menuCats.map((cat) => ({
          ...cat,
          items: items.filter((i) => i.category_id === cat.id),
        })),
      };
    });

    const assembledPackages = packageList.map((pkg) => ({
      ...pkg,
      items: packageItems.filter((i) => i.package_id === pkg.id),
    }));

    return {
      business: business as Business,
      isPreview,
      menus: assembledMenus,
      packages: assembledPackages,
      serviceAreas: (areasData || []) as ServiceArea[],
    };
  }
}


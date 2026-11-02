import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateMenuInput,
  createMenuSchema,
  CreateCategoryInput,
  createCategorySchema,
  CreateMenuItemInput,
  createMenuItemSchema,
} from "@/lib/validation/menu";
import { assertBusinessMembership } from "@/server/policies/tenant.policy";
import { Menu, MenuCategory, MenuItem, MenuStatus } from "@/types/database";
import { rupeesToPaise } from "@/lib/utils";

export interface MenuWithCategories extends Menu {
  categories: (MenuCategory & {
    items: MenuItem[];
  })[];
}

export class MenuService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Create a new menu for a business
   */
  async createMenu(
    businessId: string,
    input: CreateMenuInput
  ): Promise<Menu> {
    await assertBusinessMembership(this.supabase, businessId);
    const validated = createMenuSchema.parse(input);

    const { data, error } = await this.supabase
      .from("menus")
      .insert({
        business_id: businessId,
        name: validated.name,
        description: validated.description || null,
        menu_type: validated.menuType || null,
        status: "draft",
        display_order: 0,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create menu");
    }

    return data as Menu;
  }

  /**
   * List all menus for a business
   */
  async listMenus(businessId: string): Promise<Menu[]> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("menus")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Menu[];
  }

  /**
   * Retrieve a menu with nested categories and items
   */
  async getMenuWithDetails(
    businessId: string,
    menuId: string
  ): Promise<MenuWithCategories | null> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data: menu, error: menuError } = await this.supabase
      .from("menus")
      .select("*")
      .eq("business_id", businessId)
      .eq("id", menuId)
      .single();

    if (menuError || !menu) return null;

    const { data: categories, error: catError } = await this.supabase
      .from("menu_categories")
      .select("*")
      .eq("business_id", businessId)
      .eq("menu_id", menuId)
      .order("display_order", { ascending: true });

    if (catError) throw catError;

    const categoryIds = (categories || []).map((c) => c.id);
    let items: MenuItem[] = [];

    if (categoryIds.length > 0) {
      const { data: itemsData, error: itemsError } = await this.supabase
        .from("menu_items")
        .select("*")
        .eq("business_id", businessId)
        .in("category_id", categoryIds)
        .order("display_order", { ascending: true });

      if (itemsError) throw itemsError;
      items = (itemsData || []) as MenuItem[];
    }

    const categoriesWithItems = (categories || []).map((cat) => ({
      ...cat,
      items: items.filter((item) => item.category_id === cat.id),
    }));

    return {
      ...(menu as Menu),
      categories: categoriesWithItems,
    };
  }

  /**
   * Update menu status (draft, published, archived)
   */
  async updateMenuStatus(
    businessId: string,
    menuId: string,
    status: MenuStatus
  ): Promise<Menu> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("menus")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", menuId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update menu status");
    }

    return data as Menu;
  }

  /**
   * Add a category to a menu
   */
  async createCategory(
    businessId: string,
    input: CreateCategoryInput
  ): Promise<MenuCategory> {
    await assertBusinessMembership(this.supabase, businessId);
    const validated = createCategorySchema.parse(input);

    const { data, error } = await this.supabase
      .from("menu_categories")
      .insert({
        business_id: businessId,
        menu_id: validated.menuId,
        name: validated.name,
        description: validated.description || null,
        display_order: validated.displayOrder,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create category");
    }

    return data as MenuCategory;
  }

  /**
   * Add an item to a category
   */
  async createMenuItem(
    businessId: string,
    input: CreateMenuItemInput
  ): Promise<MenuItem> {
    await assertBusinessMembership(this.supabase, businessId);
    const validated = createMenuItemSchema.parse(input);

    const pricePaise =
      validated.priceRupees !== undefined && validated.priceRupees !== null
        ? rupeesToPaise(validated.priceRupees)
        : null;

    const { data, error } = await this.supabase
      .from("menu_items")
      .insert({
        business_id: businessId,
        category_id: validated.categoryId,
        name: validated.name,
        description: validated.description || null,
        dietary_type: validated.dietaryType,
        price_type: validated.priceType,
        price_paise: pricePaise,
        unit_label: validated.unitLabel || null,
        is_available: validated.isAvailable,
        display_order: 0,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create menu item");
    }

    return data as MenuItem;
  }

  /**
   * Toggle item availability (e.g. marked out of stock for the day)
   */
  async toggleItemAvailability(
    businessId: string,
    itemId: string,
    isAvailable: boolean
  ): Promise<MenuItem> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("menu_items")
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", itemId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update item availability");
    }

    return data as MenuItem;
  }

  /**
   * Duplicate a menu and its nested categories & items
   */
  async duplicateMenu(businessId: string, menuId: string): Promise<Menu> {
    const existing = await this.getMenuWithDetails(businessId, menuId);
    if (!existing) {
      throw new Error("Source menu not found");
    }

    // 1. Create duplicate menu record
    const newMenu = await this.createMenu(businessId, {
      name: `${existing.name} (Copy)`,
      description: existing.description || undefined,
      menuType: existing.menu_type || undefined,
    });

    // 2. Clone categories and items
    for (const category of existing.categories) {
      const newCategory = await this.createCategory(businessId, {
        menuId: newMenu.id,
        name: category.name,
        description: category.description || undefined,
        displayOrder: category.display_order,
      });

      for (const item of category.items) {
        await this.supabase.from("menu_items").insert({
          business_id: businessId,
          category_id: newCategory.id,
          name: item.name,
          description: item.description,
          dietary_type: item.dietary_type,
          price_type: item.price_type,
          price_paise: item.price_paise,
          unit_label: item.unit_label,
          is_available: item.is_available,
          display_order: item.display_order,
        });
      }
    }

    return newMenu;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MenuService } from "@/server/services/menu.service";
import { BusinessService } from "@/server/services/business.service";
import { MenuStatus, DietaryType, PriceType } from "@/types/database";

async function getActiveBusinessId(): Promise<string> {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();
  if (!businesses.length) throw new Error("No active business found");
  return businesses[0].id;
}

export async function createMenuAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const menuType = formData.get("menuType") as string;

  const supabase = await createClient();
  const menuService = new MenuService(supabase);
  await menuService.createMenu(businessId, { name, description, menuType });

  revalidatePath("/dashboard/menus");
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const menuId = formData.get("menuId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const supabase = await createClient();
  const menuService = new MenuService(supabase);
  await menuService.createCategory(businessId, {
    menuId,
    name,
    description,
    displayOrder: 0,
  });

  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function createMenuItemAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const menuId = formData.get("menuId") as string;
  const categoryId = formData.get("categoryId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const dietaryType = formData.get("dietaryType") as DietaryType;
  const priceType = formData.get("priceType") as PriceType;
  const priceRupeesStr = formData.get("priceRupees") as string;
  const unitLabel = formData.get("unitLabel") as string;

  const priceRupees = priceRupeesStr ? parseFloat(priceRupeesStr) : undefined;

  const supabase = await createClient();
  const menuService = new MenuService(supabase);
  await menuService.createMenuItem(businessId, {
    categoryId,
    name,
    description,
    dietaryType,
    priceType,
    priceRupees,
    unitLabel,
    isAvailable: true,
  });

  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function updateMenuStatusAction(
  menuId: string,
  status: MenuStatus
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const menuService = new MenuService(supabase);
  await menuService.updateMenuStatus(businessId, menuId, status);

  revalidatePath("/dashboard/menus");
  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function toggleItemAvailabilityAction(
  menuId: string,
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const menuService = new MenuService(supabase);
  await menuService.toggleItemAvailability(businessId, itemId, isAvailable);

  revalidatePath(`/dashboard/menus/${menuId}`);
}

export async function duplicateMenuAction(menuId: string): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const menuService = new MenuService(supabase);
  await menuService.duplicateMenu(businessId, menuId);

  revalidatePath("/dashboard/menus");
}

export async function loadSampleMenuAction(): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const menuService = new MenuService(supabase);

  // 1. Create a Grand Feast menu
  const menu = await menuService.createMenu(businessId, {
    name: "Grand Feast & Wedding Banquet",
    description:
      "Traditional banquet spread with welcome starters, royal main course, dum biryani, and live dessert counters.",
    menuType: "Wedding",
  });
  await menuService.updateMenuStatus(businessId, menu.id, "published");

  // 2. Categories
  const catStarters = await menuService.createCategory(businessId, {
    menuId: menu.id,
    name: "Welcome Drinks & Starters",
    description: "Served hot upon guest arrival",
    displayOrder: 1,
  });

  const catMains = await menuService.createCategory(businessId, {
    menuId: menu.id,
    name: "Main Course & Breads",
    description: "Rich curries and fresh tandoor breads",
    displayOrder: 2,
  });

  const catBiryani = await menuService.createCategory(businessId, {
    menuId: menu.id,
    name: "Biryani & Rice Delights",
    description: "Dum biryani with salan and raita",
    displayOrder: 3,
  });

  const catDesserts = await menuService.createCategory(businessId, {
    menuId: menu.id,
    name: "Traditional Desserts",
    description: "Artisanal mithai and hot desserts",
    displayOrder: 4,
  });

  // 3. Dishes
  const item1 = await menuService.createMenuItem(businessId, {
    categoryId: catStarters.id,
    name: "Paneer Tikka Angara",
    description: "Charcoal smoked cottage cheese with mint dip",
    dietaryType: "veg",
    priceType: "fixed",
    priceRupees: 220,
    unitLabel: "plate",
    isAvailable: true,
  });

  await menuService.createMenuItem(businessId, {
    categoryId: catStarters.id,
    name: "Crispy Corn Chilli Pepper",
    description: "Sweet corn tossed with scallions and crushed pepper",
    dietaryType: "veg",
    priceType: "fixed",
    priceRupees: 180,
    unitLabel: "plate",
    isAvailable: true,
  });

  const item2 = await menuService.createMenuItem(businessId, {
    categoryId: catMains.id,
    name: "Paneer Butter Masala",
    description: "Fresh cottage cheese in creamy cashew-tomato makhani gravy",
    dietaryType: "veg",
    priceType: "fixed",
    priceRupees: 280,
    unitLabel: "serving",
    isAvailable: true,
  });

  await menuService.createMenuItem(businessId, {
    categoryId: catMains.id,
    name: "Dal Makhani Bukhara",
    description: "Slow simmered black lentils finished with cream and butter",
    dietaryType: "veg",
    priceType: "fixed",
    priceRupees: 240,
    unitLabel: "serving",
    isAvailable: true,
  });

  const item3 = await menuService.createMenuItem(businessId, {
    categoryId: catBiryani.id,
    name: "Hyderabadi Veg Dum Biryani",
    description: "Long grain basmati layered with seasonal vegetables and saffron",
    dietaryType: "veg",
    priceType: "per_person",
    priceRupees: 250,
    unitLabel: "person",
    isAvailable: true,
  });

  const item4 = await menuService.createMenuItem(businessId, {
    categoryId: catDesserts.id,
    name: "Gulab Jamun with Rabdi",
    description: "Hot khoya dumplings served with chilled kesar rabdi",
    dietaryType: "veg",
    priceType: "fixed",
    priceRupees: 150,
    unitLabel: "portion",
    isAvailable: true,
  });

  // 4. Create a package too
  const { data: pkg } = await supabase
    .from("packages")
    .insert({
      business_id: businessId,
      name: "Grand Wedding Feast Package",
      description:
        "Complete 4-course banquet spread with welcome starters, royal main course, aromatic biryani, and live dessert counter.",
      pricing_type: "per_person",
      price_paise: 75000,
      minimum_guests: 50,
      is_published: true,
    })
    .select()
    .single();

  if (pkg) {
    await supabase.from("package_items").insert([
      {
        business_id: businessId,
        package_id: pkg.id,
        menu_item_id: item1.id,
        item_name_snapshot: item1.name,
        display_order: 1,
      },
      {
        business_id: businessId,
        package_id: pkg.id,
        menu_item_id: item2.id,
        item_name_snapshot: item2.name,
        display_order: 2,
      },
      {
        business_id: businessId,
        package_id: pkg.id,
        menu_item_id: item3.id,
        item_name_snapshot: item3.name,
        display_order: 3,
      },
      {
        business_id: businessId,
        package_id: pkg.id,
        menu_item_id: item4.id,
        item_name_snapshot: item4.name,
        display_order: 4,
      },
    ]);
  }

  revalidatePath("/dashboard/menus");
  revalidatePath("/dashboard/packages");
  revalidatePath("/dashboard");
}

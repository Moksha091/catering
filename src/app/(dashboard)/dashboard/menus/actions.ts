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

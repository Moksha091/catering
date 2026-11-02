"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PackageService } from "@/server/services/package.service";
import { BusinessService } from "@/server/services/business.service";
import { PackagePricingType } from "@/types/database";

async function getActiveBusinessId(): Promise<string> {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();
  if (!businesses.length) throw new Error("No active business found");
  return businesses[0].id;
}

export async function createPackageAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const pricingType = formData.get("pricingType") as PackagePricingType;
  const priceRupeesStr = formData.get("priceRupees") as string;
  const minimumGuestsStr = formData.get("minimumGuests") as string;
  const maximumGuestsStr = formData.get("maximumGuests") as string;

  const priceRupees = priceRupeesStr ? parseFloat(priceRupeesStr) : undefined;
  const minimumGuests = minimumGuestsStr ? parseInt(minimumGuestsStr, 10) : undefined;
  const maximumGuests = maximumGuestsStr ? parseInt(maximumGuestsStr, 10) : undefined;

  const supabase = await createClient();
  const packageService = new PackageService(supabase);
  await packageService.createPackage(businessId, {
    name,
    description,
    pricingType,
    priceRupees,
    minimumGuests,
    maximumGuests,
    isPublished: false,
  });

  revalidatePath("/dashboard/packages");
}

export async function addPackageItemAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const packageId = formData.get("packageId") as string;
  const itemNameSnapshot = formData.get("itemNameSnapshot") as string;
  const quantityOrDescription = formData.get("quantityOrDescription") as string;

  const supabase = await createClient();
  const packageService = new PackageService(supabase);
  await packageService.addPackageItem(businessId, {
    packageId,
    itemNameSnapshot,
    quantityOrDescription,
  });

  revalidatePath("/dashboard/packages");
}

export async function removePackageItemAction(
  packageItemId: string
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const packageService = new PackageService(supabase);
  await packageService.removePackageItem(businessId, packageItemId);

  revalidatePath("/dashboard/packages");
}

export async function setPackagePublishedAction(
  packageId: string,
  isPublished: boolean
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const packageService = new PackageService(supabase);
  await packageService.setPackagePublished(businessId, packageId, isPublished);

  revalidatePath("/dashboard/packages");
}

export async function duplicatePackageAction(
  packageId: string
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const packageService = new PackageService(supabase);
  await packageService.duplicatePackage(businessId, packageId);

  revalidatePath("/dashboard/packages");
}

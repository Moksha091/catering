import * as React from "react";
import {
  Package as PackageIcon,
  Plus,
  Users,
  CheckCircle,
  Copy,
  Trash2,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PackageService } from "@/server/services/package.service";
import { BusinessService } from "@/server/services/business.service";
import {
  createPackageAction,
  addPackageItemAction,
  removePackageItemAction,
  setPackagePublishedAction,
  duplicatePackageAction,
} from "@/app/(dashboard)/dashboard/packages/actions";
import { formatPaiseToINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PackagesListPage() {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();

  if (!businesses.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Please create a business profile first.</p>
      </div>
    );
  }

  const business = businesses[0];
  const packageService = new PackageService(supabase);
  const packages = await packageService.listPackages(business.id);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Catering Packages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bundle signature dishes into per-plate or fixed catering packages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Packages List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PackageIcon className="h-5 w-5 text-primary" />
            <span>Configured Packages ({packages.length})</span>
          </h2>

          {packages.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <PackageIcon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No packages created yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create clear packages (e.g. &quot;Standard Veg Buffet&quot; or &quot;Royal Wedding Spread&quot;) with per-person pricing to simplify client bookings.
              </p>
            </Card>
          ) : (
            packages.map((pkg) => (
              <Card key={pkg.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            pkg.is_published
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {pkg.is_published ? "Live" : "Draft"}
                        </span>
                      </div>
                      {pkg.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {pkg.description}
                        </CardDescription>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {pkg.pricing_type === "per_person" && pkg.price_paise !== null && (
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {formatPaiseToINR(pkg.price_paise)}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            / person
                          </span>
                        </div>
                      )}
                      {pkg.pricing_type === "starting_from" && pkg.price_paise !== null && (
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Starting from
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {formatPaiseToINR(pkg.price_paise)}
                          </span>
                        </div>
                      )}
                      {pkg.pricing_type === "fixed" && pkg.price_paise !== null && (
                        <span className="text-lg font-bold text-foreground">
                          {formatPaiseToINR(pkg.price_paise)}
                        </span>
                      )}
                      {pkg.pricing_type === "quote_required" && (
                        <span className="text-xs text-muted-foreground italic">
                          Custom Quote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Guest count constraint pills */}
                  {(pkg.minimum_guests || pkg.maximum_guests) && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {pkg.minimum_guests ? `Min ${pkg.minimum_guests} guests` : ""}
                        {pkg.minimum_guests && pkg.maximum_guests ? " • " : ""}
                        {pkg.maximum_guests ? `Max ${pkg.maximum_guests} guests` : ""}
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-2 space-y-4">
                  {/* Inclusions List */}
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Included In This Package ({pkg.items.length})
                    </p>

                    {pkg.items.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No items added yet. Specify welcome drinks, curries, breads, desserts...
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {pkg.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-muted/40 px-2.5 py-1.5 rounded border"
                          >
                            <span className="font-medium truncate">
                              • {item.item_name_snapshot}
                              {item.quantity_or_description && (
                                <span className="text-muted-foreground ml-1">
                                  ({item.quantity_or_description})
                                </span>
                              )}
                            </span>

                            <form
                              action={async () => {
                                "use server";
                                await removePackageItemAction(item.id);
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                type="submit"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                title="Remove item"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Inclusion Form */}
                    <form action={addPackageItemAction} className="flex gap-2 pt-2">
                      <input type="hidden" name="packageId" value={pkg.id} />
                      <Input
                        name="itemNameSnapshot"
                        placeholder="Add dish inclusion (e.g. 2 Starters + Biryani + Gulab Jamun)"
                        required
                        className="h-8 text-xs flex-1"
                      />
                      <Input
                        name="quantityOrDescription"
                        placeholder="e.g. Unlimited"
                        className="h-8 text-xs w-28 shrink-0"
                      />
                      <Button type="submit" size="sm" className="h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </form>
                  </div>

                  {/* Footer actions: Duplicate & Publish */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <form
                      action={async () => {
                        "use server";
                        await duplicatePackageAction(pkg.id);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        type="submit"
                        className="h-7 text-xs gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Duplicate</span>
                      </Button>
                    </form>

                    <div>
                      {pkg.is_published ? (
                        <form
                          action={async () => {
                            "use server";
                            await setPackagePublishedAction(pkg.id, false);
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="h-7 text-xs text-amber-600 hover:text-amber-700"
                          >
                            Unpublish
                          </Button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await setPackagePublishedAction(pkg.id, true);
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            type="submit"
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Publish to Storefront
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Package Card */}
        <div>
          <Card className="sticky top-20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Create Package</span>
              </CardTitle>
              <CardDescription>
                Define bundles with clear guest rules and pricing.
              </CardDescription>
            </CardHeader>

            <form action={createPackageAction}>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="pkgName">Package Name *</Label>
                  <Input
                    id="pkgName"
                    name="name"
                    placeholder="e.g. Premium Wedding Feast"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pkgPricingType">Pricing Structure</Label>
                  <select
                    id="pkgPricingType"
                    name="pricingType"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    defaultValue="per_person"
                  >
                    <option value="per_person">Price Per Person / Plate</option>
                    <option value="starting_from">Starting From Price</option>
                    <option value="fixed">Fixed Total Package Price</option>
                    <option value="quote_required">Quote Required</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pkgPrice">Price (₹)</Label>
                  <Input
                    id="pkgPrice"
                    name="priceRupees"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 650"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>Stored accurately in integer paise for quotes and invoices.</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="pkgMin" className="text-xs">
                      Min Guests
                    </Label>
                    <Input
                      id="pkgMin"
                      name="minimumGuests"
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pkgMax" className="text-xs">
                      Max Guests
                    </Label>
                    <Input
                      id="pkgMax"
                      name="maximumGuests"
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pkgDesc">Description & Inclusions Summary</Label>
                  <Textarea
                    id="pkgDesc"
                    name="description"
                    placeholder="Includes 3 welcome drinks, 4 live counter starters, full buffet, serving staff, and setup."
                    rows={3}
                  />
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Button type="submit" className="w-full">
                  Create Package
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

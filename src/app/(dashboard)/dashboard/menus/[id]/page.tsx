import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  FolderPlus,
  CheckCircle,
  EyeOff,
  Leaf,
  Beef,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MenuService } from "@/server/services/menu.service";
import { BusinessService } from "@/server/services/business.service";
import {
  createCategoryAction,
  createMenuItemAction,
  toggleItemAvailabilityAction,
  updateMenuStatusAction,
} from "@/app/(dashboard)/dashboard/menus/actions";
import { formatPaiseToINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: menuId } = await params;
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();

  if (!businesses.length) {
    notFound();
  }

  const business = businesses[0];
  const menuService = new MenuService(supabase);
  const menu = await menuService.getMenuWithDetails(business.id, menuId);

  if (!menu) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header with back button & status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2">
              <Link href="/dashboard/menus">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>All Menus</span>
              </Link>
            </Button>
            <span className="text-muted-foreground">•</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                menu.status === "published"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {menu.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {menu.name}
          </h1>
          {menu.description && (
            <p className="text-sm text-muted-foreground">{menu.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {menu.status !== "published" ? (
            <form
              action={async () => {
                "use server";
                await updateMenuStatusAction(menu.id, "published");
              }}
            >
              <Button type="submit" size="sm">
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Publish Menu
              </Button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await updateMenuStatusAction(menu.id, "draft");
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Unpublish to Draft
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Categories & Dishes Display */}
        <div className="lg:col-span-2 space-y-6">
          {menu.categories.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderPlus className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No categories yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add categories like &quot;Starters&quot;, &quot;Main Course&quot;, or &quot;Desserts&quot; using the form on the right.
              </p>
            </Card>
          ) : (
            menu.categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <CardDescription className="text-xs mt-0.5">
                          {category.description}
                        </CardDescription>
                      )}
                    </div>
                    <span className="text-xs bg-background border px-2 py-0.5 rounded font-mono text-muted-foreground">
                      {category.items.length} items
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  {/* Items in this category */}
                  {category.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 italic">
                      No dishes in this category yet. Use the item form below.
                    </p>
                  ) : (
                    <div className="divide-y">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            !item.is_available ? "opacity-60 bg-muted/20 px-2 rounded" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Dietary indicator */}
                              {item.dietary_type === "veg" ? (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
                                  <Leaf className="h-3 w-3" /> Veg
                                </span>
                              ) : item.dietary_type === "non_veg" ? (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">
                                  <Beef className="h-3 w-3" /> Non-Veg
                                </span>
                              ) : null}

                              <span className="font-semibold text-sm">
                                {item.name}
                              </span>

                              {!item.is_available && (
                                <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                                  Unavailable
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Price label */}
                            <div className="text-right">
                              {item.price_type === "fixed" && item.price_paise !== null && (
                                <span className="font-semibold text-sm text-foreground">
                                  {formatPaiseToINR(item.price_paise)}
                                </span>
                              )}
                              {item.price_type === "per_person" && item.price_paise !== null && (
                                <span className="font-semibold text-sm text-foreground">
                                  {formatPaiseToINR(item.price_paise)} / person
                                </span>
                              )}
                              {item.price_type === "market_rate" && (
                                <span className="text-xs text-muted-foreground italic">
                                  Market Price
                                </span>
                              )}
                              {item.price_type === "quote_required" && (
                                <span className="text-xs text-muted-foreground italic">
                                  Quote on Request
                                </span>
                              )}
                            </div>

                            {/* Toggle availability */}
                            <form
                              action={async () => {
                                "use server";
                                await toggleItemAvailabilityAction(
                                  menu.id,
                                  item.id,
                                  !item.is_available
                                );
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                type="submit"
                                className="h-7 text-xs px-2"
                                title={
                                  item.is_available
                                    ? "Mark unavailable"
                                    : "Mark available"
                                }
                              >
                                {item.is_available ? (
                                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                )}
                              </Button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Add Item Accordion / Form */}
                  <details className="mt-4 border-t pt-3 group">
                    <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Dish to {category.name}</span>
                    </summary>

                    <form
                      action={createMenuItemAction}
                      className="mt-3 space-y-3 bg-muted/20 p-3 rounded-lg border text-xs"
                    >
                      <input type="hidden" name="menuId" value={menu.id} />
                      <input type="hidden" name="categoryId" value={category.id} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`item-name-${category.id}`} className="text-xs">
                            Dish Name *
                          </Label>
                          <Input
                            id={`item-name-${category.id}`}
                            name="name"
                            placeholder="e.g. Paneer Butter Masala"
                            required
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`item-diet-${category.id}`} className="text-xs">
                            Dietary Tag
                          </Label>
                          <select
                            id={`item-diet-${category.id}`}
                            name="dietaryType"
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                            defaultValue="veg"
                          >
                            <option value="veg">Vegetarian (Veg)</option>
                            <option value="non_veg">Non-Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="egg">Egg</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`item-ptype-${category.id}`} className="text-xs">
                            Pricing Mode
                          </Label>
                          <select
                            id={`item-ptype-${category.id}`}
                            name="priceType"
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                            defaultValue="fixed"
                          >
                            <option value="fixed">Fixed Item Price</option>
                            <option value="per_person">Price Per Person</option>
                            <option value="market_rate">Market Rate</option>
                            <option value="quote_required">Quote Required</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`item-price-${category.id}`} className="text-xs">
                            Price (₹)
                          </Label>
                          <Input
                            id={`item-price-${category.id}`}
                            name="priceRupees"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="e.g. 250"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`item-desc-${category.id}`} className="text-xs">
                          Description (Optional)
                        </Label>
                        <Input
                          id={`item-desc-${category.id}`}
                          name="description"
                          placeholder="Rich cashew and tomato gravy with cottage cheese"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button type="submit" size="sm" className="h-7 text-xs">
                          Save Dish
                        </Button>
                      </div>
                    </form>
                  </details>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar: Add Category */}
        <div className="space-y-6">
          <Card className="sticky top-20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-primary" />
                <span>Add Category</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Organize this menu by courses or food styles.
              </CardDescription>
            </CardHeader>

            <form action={createCategoryAction}>
              <CardContent className="space-y-3 text-xs">
                <input type="hidden" name="menuId" value={menu.id} />

                <div className="space-y-1">
                  <Label htmlFor="catName" className="text-xs">
                    Category Name *
                  </Label>
                  <Input
                    id="catName"
                    name="name"
                    placeholder="e.g. Welcome Drinks, Starters, Biryani"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="catDesc" className="text-xs">
                    Description (Optional)
                  </Label>
                  <Input
                    id="catDesc"
                    name="description"
                    placeholder="e.g. Served hot with homemade chutneys"
                    className="h-9 text-xs"
                  />
                </div>
              </CardContent>

              <div className="p-4 pt-0">
                <Button type="submit" size="sm" className="w-full text-xs">
                  Create Category
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

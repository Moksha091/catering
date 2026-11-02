import * as React from "react";
import Link from "next/link";
import {
  Utensils,
  Plus,
  ArrowRight,
  Copy,
  CheckCircle,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MenuService } from "@/server/services/menu.service";
import { BusinessService } from "@/server/services/business.service";
import {
  createMenuAction,
  duplicateMenuAction,
  updateMenuStatusAction,
} from "@/app/(dashboard)/dashboard/menus/actions";
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

export default async function MenusListPage() {
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
  const menuService = new MenuService(supabase);
  const menus = await menuService.listMenus(business.id);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Menus & Dishes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create menus for weddings, vegetarian feasts, snacks, or festivals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Existing Menus List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span>Your Menus ({menus.length})</span>
          </h2>

          {menus.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No menus created yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create your first menu on the right (e.g. &quot;Grand Wedding Buffet&quot; or &quot;South Indian Lunch&quot;) to start adding dishes.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {menus.map((menu) => (
                <Card key={menu.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Link
                            href={`/dashboard/menus/${menu.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {menu.name}
                          </Link>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              menu.status === "published"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : menu.status === "archived"
                                ? "bg-muted text-muted-foreground border"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            {menu.status === "published"
                              ? "Published"
                              : menu.status === "archived"
                              ? "Archived"
                              : "Draft"}
                          </span>
                        </CardTitle>
                        {menu.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {menu.description}
                          </CardDescription>
                        )}
                      </div>
                      {menu.menu_type && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {menu.menu_type}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 flex flex-wrap items-center justify-between gap-3 border-t mt-4 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Click below to organize categories and dishes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Duplicate Menu */}
                      <form
                        action={async () => {
                          "use server";
                          await duplicateMenuAction(menu.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          type="submit"
                          className="h-8 gap-1 text-xs"
                          title="Duplicate this menu"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Duplicate</span>
                        </Button>
                      </form>

                      {/* Status Toggle */}
                      {menu.status !== "published" ? (
                        <form
                          action={async () => {
                            "use server";
                            await updateMenuStatusAction(menu.id, "published");
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            type="submit"
                            className="h-8 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Publish
                          </Button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await updateMenuStatusAction(menu.id, "draft");
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="h-8 text-xs text-amber-600 hover:text-amber-700"
                          >
                            Unpublish
                          </Button>
                        </form>
                      )}

                      <Button size="sm" asChild className="h-8 text-xs">
                        <Link href={`/dashboard/menus/${menu.id}`}>
                          <span>Manage Dishes</span>
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add New Menu Card */}
        <div>
          <Card className="sticky top-20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Add New Menu</span>
              </CardTitle>
              <CardDescription>
                Group your offerings into distinct menus.
              </CardDescription>
            </CardHeader>
            <form action={createMenuAction}>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="name">Menu Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Wedding Feast Menu"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="menuType">Menu Type (Optional)</Label>
                  <Input
                    id="menuType"
                    name="menuType"
                    placeholder="e.g. Wedding, Snacks, Festival"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of this menu collection..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button type="submit" className="w-full">
                  Create Menu
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

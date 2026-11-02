import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  MessageCircle,
  Users,
  Leaf,
  Beef,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StorefrontService } from "@/server/services/storefront.service";
import { formatPaiseToINR } from "@/lib/utils";
import { PublicEnquiryForm } from "@/components/storefront/PublicEnquiryForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const storefrontService = new StorefrontService(supabase);
  const data = await storefrontService.getPublicStorefrontBySlug(slug);

  if (!data) {
    return {
      title: "Caterer Not Found - RasoiSync",
    };
  }

  const { business } = data;
  return {
    title: `${business.name} - Catering Menu & Packages`,
    description:
      business.description ||
      `Explore catering menus, wedding packages, and event pricing from ${business.name} in ${business.city || "India"}.`,
    openGraph: {
      title: `${business.name} | Catering Menu`,
      description: business.description || undefined,
    },
  };
}

export default async function PublicStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const storefrontService = new StorefrontService(supabase);
  const data = await storefrontService.getPublicStorefrontBySlug(slug);

  if (!data) {
    notFound();
  }

  const { business, menus, packages, serviceAreas } = data;

  const waShareText = encodeURIComponent(
    `Hi! I found your catering storefront for ${business.name}. I'd like to check menu options and date availability.`
  );
  const waContactLink = business.whatsapp_phone
    ? `https://wa.me/${business.whatsapp_phone.replace(/[^0-9]/g, "")}?text=${waShareText}`
    : `https://wa.me/?text=${waShareText}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero / Business Header */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background border-b py-10 md:py-14">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                    {business.name}
                  </h1>
                </div>
              </div>

              {business.description && (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {business.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground pt-1">
                {business.city && (
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{business.city}{business.state ? `, ${business.state}` : ""}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{business.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="whatsapp" size="lg" asChild className="shadow-md">
                <a href={waContactLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <a href="#enquire">Request Quote</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-12">
        {/* Packages Section */}
        {packages.length > 0 && (
          <section id="packages" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Catering Packages
                </h2>
                <p className="text-sm text-muted-foreground">
                  Convenient bundled menus with transparent per-person pricing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                        {(pkg.minimum_guests || pkg.maximum_guests) && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {pkg.minimum_guests ? `Min ${pkg.minimum_guests} guests` : ""}
                              {pkg.minimum_guests && pkg.maximum_guests ? " • " : ""}
                              {pkg.maximum_guests ? `Max ${pkg.maximum_guests} guests` : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {pkg.pricing_type === "per_person" && pkg.price_paise !== null && (
                          <div>
                            <span className="text-2xl font-black text-primary">
                              {formatPaiseToINR(pkg.price_paise)}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              per person
                            </span>
                          </div>
                        )}
                        {pkg.pricing_type === "starting_from" && pkg.price_paise !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              Starting from
                            </span>
                            <span className="text-xl font-extrabold text-primary">
                              {formatPaiseToINR(pkg.price_paise)}
                            </span>
                          </div>
                        )}
                        {pkg.pricing_type === "fixed" && pkg.price_paise !== null && (
                          <span className="text-xl font-extrabold text-primary">
                            {formatPaiseToINR(pkg.price_paise)}
                          </span>
                        )}
                        {pkg.pricing_type === "quote_required" && (
                          <span className="text-sm font-semibold text-muted-foreground italic">
                            Quote Required
                          </span>
                        )}
                      </div>
                    </div>

                    {pkg.description && (
                      <CardDescription className="text-xs mt-2 leading-relaxed">
                        {pkg.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Inclusions */}
                    {pkg.items.length > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Package Inclusions
                        </p>
                        <ul className="grid grid-cols-1 gap-1.5 text-xs text-foreground/90">
                          {pkg.items.map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>
                                <span className="font-medium">{item.item_name_snapshot}</span>
                                {item.quantity_or_description && (
                                  <span className="text-muted-foreground ml-1">
                                    ({item.quantity_or_description})
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button size="sm" asChild className="w-full">
                        <a href="#enquire">Choose This Package</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Menus & Dishes Section */}
        {menus.length > 0 && (
          <section id="menus" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Full Menus & Specialties</h2>
              <p className="text-sm text-muted-foreground">
                Browse our fresh courses, curries, live counters, and desserts.
              </p>
            </div>

            <div className="space-y-8">
              {menus.map((menu) => (
                <div key={menu.id} className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {menu.name}
                    </h3>
                    {menu.menu_type && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                        {menu.menu_type}
                      </span>
                    )}
                  </div>

                  {menu.categories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base text-foreground">
                          {category.name}
                        </h4>
                        {category.description && (
                          <span className="text-xs text-muted-foreground">
                            — {category.description}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.items.map((dish) => (
                          <div
                            key={dish.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/40 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {dish.dietary_type === "veg" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1 rounded">
                                    <Leaf className="h-3 w-3" /> Veg
                                  </span>
                                )}
                                {dish.dietary_type === "non_veg" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-1 rounded">
                                    <Beef className="h-3 w-3" /> Non-Veg
                                  </span>
                                )}
                                <span className="font-semibold text-sm">
                                  {dish.name}
                                </span>
                              </div>

                              {dish.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {dish.description}
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0 font-medium text-xs">
                              {dish.price_type === "fixed" && dish.price_paise !== null && (
                                <span className="text-foreground font-bold">
                                  {formatPaiseToINR(dish.price_paise)}
                                </span>
                              )}
                              {dish.price_type === "per_person" && dish.price_paise !== null && (
                                <span className="text-foreground font-bold">
                                  {formatPaiseToINR(dish.price_paise)} / person
                                </span>
                              )}
                              {dish.price_type === "market_rate" && (
                                <span className="text-muted-foreground italic">
                                  Market Price
                                </span>
                              )}
                              {dish.price_type === "quote_required" && (
                                <span className="text-muted-foreground italic">
                                  On Quote
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Service Areas Section */}
        {serviceAreas.length > 0 && (
          <section id="service-areas" className="space-y-4 border-t pt-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Service Areas & Delivery</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {serviceAreas.map((area) => (
                <div key={area.id} className="p-4 rounded-lg border bg-card text-xs space-y-1">
                  <p className="font-bold text-sm text-foreground">{area.city}</p>
                  {area.locality && (
                    <p className="text-muted-foreground">{area.locality}</p>
                  )}
                  {area.travel_fee_paise > 0 ? (
                    <p className="text-muted-foreground">
                      Travel / transport fee: {formatPaiseToINR(area.travel_fee_paise)}
                    </p>
                  ) : (
                    <p className="text-emerald-600 font-semibold">Free delivery area</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Public Enquiry Form */}
        <section className="pt-8 border-t">
          <PublicEnquiryForm slug={slug} packages={packages} />
        </section>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur border-t p-3 flex gap-3 shadow-lg">
        <Button variant="whatsapp" className="flex-1" asChild>
          <a href={waContactLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span>WhatsApp</span>
          </a>
        </Button>
        <Button className="flex-1" asChild>
          <a href="#enquire">Request Quote</a>
        </Button>
      </div>
    </div>
  );
}

import * as React from "react";
import {
  FileText,
  Plus,
  Send,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuoteService } from "@/server/services/quote.service";
import { EnquiryService } from "@/server/services/enquiry.service";
import { BusinessService } from "@/server/services/business.service";
import {
  createQuoteAction,
  sendQuoteAction,
} from "@/app/(dashboard)/dashboard/quotes/actions";
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

export default async function QuotesDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ enquiryId?: string }>;
}) {
  const { enquiryId } = await searchParams;

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
  const quoteService = new QuoteService(supabase);
  const enquiryService = new EnquiryService(supabase);

  const [quotes, enquiries] = await Promise.all([
    quoteService.listBusinessQuotes(business.id),
    enquiryService.listBusinessEnquiries(business.id),
  ]);

  const selectedEnquiry = enquiryId
    ? enquiries.find((e) => e.id === enquiryId)
    : undefined;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Quotations & Estimates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create tamper-proof versioned quotes with unguessable customer links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quotes List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Generated Quotes ({quotes.length})</span>
          </h2>

          {quotes.length === 0 ? (
            <Card className="border-dashed p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No quotes prepared yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Select an enquiry on the right to prepare an official quotation with line items and deposit terms.
              </p>
            </Card>
          ) : (
            quotes.map((quote) => {
              const matchedEnquiry = enquiries.find(
                (e) => e.id === quote.enquiry_id
              );

              return (
                <Card key={quote.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-bold">
                            {matchedEnquiry
                              ? `${matchedEnquiry.customer_name} (${matchedEnquiry.event_type || "Event"})`
                              : `Quote #${quote.id.slice(0, 8)}`}
                          </CardTitle>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              quote.status === "accepted"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : quote.status === "sent"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : quote.status === "declined"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : "bg-muted text-muted-foreground border"
                            }`}
                          >
                            {quote.status.toUpperCase()} (v{quote.version})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Created on{" "}
                          {new Date(quote.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl font-bold text-foreground">
                          {formatPaiseToINR(quote.total_paise)}
                        </span>
                        {quote.deposit_paise > 0 && (
                          <span className="text-xs text-muted-foreground block">
                            Deposit: {formatPaiseToINR(quote.deposit_paise)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    {quote.notes && (
                      <p className="text-xs text-muted-foreground italic border-l-2 pl-2">
                        &quot;{quote.notes}&quot;
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
                      {quote.valid_until && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Valid until{" "}
                            {new Date(quote.valid_until).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        {quote.status === "draft" && (
                          <form
                            action={async () => {
                              "use server";
                              await sendQuoteAction(quote.id);
                            }}
                          >
                            <Button size="sm" type="submit" className="h-8 text-xs">
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                              Send & Lock Quote
                            </Button>
                          </form>
                        )}

                        {quote.status !== "draft" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Locked (v{quote.version})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Create Quote Form */}
        <div>
          <Card className="sticky top-20 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Prepare Quotation</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedEnquiry
                  ? `For ${selectedEnquiry.customer_name} (${selectedEnquiry.guest_count || "flexible"} guests)`
                  : "Calculate official pricing for a customer enquiry."}
              </CardDescription>
            </CardHeader>

            <form action={createQuoteAction}>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="enquiryId" className="text-xs">
                    Select Enquiry *
                  </Label>
                  <select
                    id="enquiryId"
                    name="enquiryId"
                    required
                    defaultValue={selectedEnquiry?.id || (enquiries[0]?.id ?? "")}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    {enquiries.length === 0 ? (
                      <option value="">No enquiries available</option>
                    ) : (
                      enquiries.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.customer_name} — {e.event_type || "Event"} ({e.event_date || "Date flexible"})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs">
                    Package / Service Description *
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="e.g. Royal Wedding Buffet with Live Counters"
                    required
                    className="h-9 text-xs"
                    defaultValue={selectedEnquiry?.selected_package_id ? "Catering Package Booking" : ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quantity" className="text-xs">
                      Guest Count / Qty *
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      defaultValue={selectedEnquiry?.guest_count || 100}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="unitPriceRupees" className="text-xs">
                      Price Per Person (₹) *
                    </Label>
                    <Input
                      id="unitPriceRupees"
                      name="unitPriceRupees"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 650"
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="discountRupees" className="text-xs">
                      Discount (₹)
                    </Label>
                    <Input
                      id="discountRupees"
                      name="discountRupees"
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="depositRupees" className="text-xs">
                      Deposit Due (₹)
                    </Label>
                    <Input
                      id="depositRupees"
                      name="depositRupees"
                      type="number"
                      min="0"
                      placeholder="e.g. 20000"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="validUntil" className="text-xs">
                    Quote Validity Date
                  </Label>
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-xs">
                    Payment Terms & Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="e.g. 50% deposit required upon confirmation. Balance due on event day."
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </CardContent>

              <div className="p-4 pt-0">
                <Button
                  type="submit"
                  disabled={enquiries.length === 0}
                  className="w-full text-xs"
                >
                  Create Draft Quote
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

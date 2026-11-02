import * as React from "react";
import { notFound } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  UtensilsCrossed,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuoteService } from "@/server/services/quote.service";
import { formatPaiseToINR } from "@/lib/utils";
import {
  acceptPublicQuoteAction,
  declinePublicQuoteAction,
} from "@/app/quote/[token]/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const quoteService = new QuoteService(supabase);
  const data = await quoteService.getPublicQuoteByToken(token);

  if (!data) {
    notFound();
  }

  const { quote, items, business } = data;
  const isExpired =
    quote.valid_until && new Date(quote.valid_until) < new Date();

  const waText = encodeURIComponent(
    `Hi ${business.name}, I reviewed Quote (Version ${quote.version}) for ${formatPaiseToINR(
      quote.total_paise
    )}. I would like to discuss next steps!`
  );
  const waContactLink = business.whatsapp_phone
    ? `https://wa.me/${business.whatsapp_phone.replace(/[^0-9]/g, "")}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      <div className="container max-w-3xl space-y-6">
        {/* Caterer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-card p-6 rounded-xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold">{business.name}</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {business.city ? `${business.city} • ` : ""}
              Contact: {business.phone || "Available on WhatsApp"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="whatsapp" size="sm" asChild>
              <a href={waContactLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Status Alert Banners */}
        {quote.status === "accepted" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Quote Accepted</p>
              <p className="text-emerald-700">
                You have accepted this quotation. The caterer will be in touch to finalize your booking schedule.
              </p>
            </div>
          </div>
        )}

        {quote.status === "declined" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800">
            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Quote Declined</p>
              <p className="text-rose-700">
                This estimate has been marked as declined. Please contact the caterer if you need modifications.
              </p>
            </div>
          </div>
        )}

        {quote.status === "sent" && isExpired && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-800">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Quote Expired</p>
              <p className="text-amber-700">
                This quote validity date has passed. Please contact the caterer for an updated estimate.
              </p>
            </div>
          </div>
        )}

        {/* Main Quotation Sheet */}
        <Card className="shadow-md">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <span>Catering Quotation</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Version {quote.version} • Created on{" "}
                  {new Date(quote.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>

              {quote.valid_until && (
                <div className="text-xs sm:text-right">
                  <span className="text-muted-foreground block">Valid Until</span>
                  <span className="font-semibold text-foreground">
                    {new Date(quote.valid_until).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2.5 font-semibold">Description</th>
                    <th className="py-2.5 font-semibold text-center">Qty</th>
                    <th className="py-2.5 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium pr-2">
                        {item.description}
                      </td>
                      <td className="py-3 text-center text-muted-foreground">
                        {item.quantity} {item.unit || ""}
                      </td>
                      <td className="py-3 text-right">
                        {formatPaiseToINR(item.unit_price_paise)}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {formatPaiseToINR(item.line_total_paise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t pt-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPaiseToINR(quote.subtotal_paise)}</span>
              </div>

              {quote.discount_paise > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>- {formatPaiseToINR(quote.discount_paise)}</span>
                </div>
              )}

              {quote.tax_paise > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes / GST</span>
                  <span>+ {formatPaiseToINR(quote.tax_paise)}</span>
                </div>
              )}

              {quote.additional_charges_paise > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Additional Charges (Service/Transport)</span>
                  <span>+ {formatPaiseToINR(quote.additional_charges_paise)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline border-t pt-3 text-base sm:text-lg font-black text-foreground">
                <span>Total Amount</span>
                <span className="text-primary text-xl sm:text-2xl">
                  {formatPaiseToINR(quote.total_paise)}
                </span>
              </div>

              {quote.deposit_paise > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Initial Deposit Required</span>
                  <span className="font-semibold text-foreground">
                    {formatPaiseToINR(quote.deposit_paise)}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="border-t pt-4 space-y-1 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p className="font-semibold text-foreground">Special Instructions & Notes:</p>
                <p className="whitespace-pre-line leading-relaxed">{quote.notes}</p>
              </div>
            )}
          </CardContent>

          {/* Action Buttons for Client */}
          {quote.status === "sent" && !isExpired && (
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-muted/10 p-6">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Accepting locks in the quoted price and reserves your booking pending caterer confirmation.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <form
                  action={async () => {
                    "use server";
                    await declinePublicQuoteAction(token);
                  }}
                  className="w-1/2 sm:w-auto"
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full text-rose-600 hover:text-rose-700"
                  >
                    Decline
                  </Button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await acceptPublicQuoteAction(token);
                  }}
                  className="w-1/2 sm:w-auto"
                >
                  <Button type="submit" className="w-full shadow-md">
                    Accept Quote
                  </Button>
                </form>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

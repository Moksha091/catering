import * as React from "react";
import Link from "next/link";
import {
  Inbox,
  MessageCircle,
  Phone,
  Calendar,
  Users,
  MapPin,
  Clock,
  FilePlus2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EnquiryService } from "@/server/services/enquiry.service";
import { BusinessService } from "@/server/services/business.service";
import {
  updateEnquiryStatusAction,
  updateEnquiryNotesAction,
} from "@/app/(dashboard)/dashboard/enquiries/actions";
import { EnquiryStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EnquiriesDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const statusFilter = statusParam as EnquiryStatus | undefined;

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
  const enquiryService = new EnquiryService(supabase);
  const enquiries = await enquiryService.listBusinessEnquiries(
    business.id,
    statusFilter
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Customer Enquiries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Incoming booking requests and custom menu inquiries.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { label: "All", value: "" },
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Quote Sent", value: "quote_sent" },
            { label: "Converted", value: "converted" },
            { label: "Declined", value: "declined" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={statusFilter === tab.value || (!statusFilter && !tab.value) ? "default" : "outline"}
              size="sm"
              asChild
              className="h-7 text-xs"
            >
              <Link
                href={
                  tab.value
                    ? `/dashboard/enquiries?status=${tab.value}`
                    : `/dashboard/enquiries`
                }
              >
                {tab.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {enquiries.length === 0 ? (
        <Card className="border-dashed p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">No enquiries found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {statusFilter
              ? `No enquiries match the "${statusFilter}" filter.`
              : "When customers submit requests on your storefront or via WhatsApp, they will appear here organized by date."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const cleanPhone = enq.customer_phone.replace(/[^0-9]/g, "");
            const waText = encodeURIComponent(
              `Hi ${enq.customer_name}, thank you for your catering enquiry for ${
                enq.event_date || "your upcoming event"
              }. I'm reaching out from ${business.name} to confirm your requirements!`
            );
            const waChatLink = `https://wa.me/${cleanPhone}?text=${waText}`;

            return (
              <Card key={enq.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold">
                          {enq.customer_name}
                        </CardTitle>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            enq.status === "new"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : enq.status === "converted"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : enq.status === "quote_sent"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : enq.status === "declined"
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : "bg-muted text-muted-foreground border"
                          }`}
                        >
                          {enq.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Received on{" "}
                        {new Date(enq.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="whatsapp" size="sm" asChild className="h-8 text-xs">
                        <a href={waChatLink} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          <span>WhatsApp Client</span>
                        </a>
                      </Button>

                      <Button size="sm" asChild className="h-8 text-xs">
                        <Link href={`/dashboard/quotes?enquiryId=${enq.id}`}>
                          <FilePlus2 className="h-3.5 w-3.5 mr-1" />
                          <span>Create Quote</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border text-xs">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Date
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {enq.event_date || "Not specified"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Guests
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {enq.guest_count ? `${enq.guest_count} persons` : "Flexible"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Event Type
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {enq.event_type || "General Catering"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Phone
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {enq.customer_phone}
                      </span>
                    </div>
                  </div>

                  {enq.venue_address && (
                    <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{enq.venue_address}{enq.city ? `, ${enq.city}` : ""}</span>
                    </div>
                  )}

                  {enq.customer_notes && (
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-foreground">Client Notes:</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {enq.customer_notes}
                      </p>
                    </div>
                  )}

                  {/* Internal Notes & Status Update Accordion */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-3 text-xs">
                    {/* Status updater */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">Status:</span>
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const nextStatus = formData.get("status") as EnquiryStatus;
                          await updateEnquiryStatusAction(enq.id, nextStatus);
                        }}
                      >
                        <select
                          name="status"
                          defaultValue={enq.status}
                          onChange={(e) => e.target.form?.requestSubmit()}
                          className="h-7 rounded border border-input bg-background px-2 text-xs"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="quote_sent">Quote Sent</option>
                          <option value="converted">Converted</option>
                          <option value="declined">Declined</option>
                          <option value="closed">Closed</option>
                        </select>
                      </form>
                    </div>

                    {/* Internal Notes Dialog/Form */}
                    <details className="w-full sm:w-auto">
                      <summary className="cursor-pointer font-medium text-primary hover:underline">
                        {enq.internal_notes ? "View/Edit Notes" : "+ Add Internal Note"}
                      </summary>
                      <form
                        action={updateEnquiryNotesAction}
                        className="mt-2 space-y-2 bg-muted/40 p-3 rounded border text-xs"
                      >
                        <input type="hidden" name="enquiryId" value={enq.id} />
                        <Textarea
                          name="internalNotes"
                          defaultValue={enq.internal_notes || ""}
                          placeholder="e.g. Spoke on phone, prefers banana leaf service, call back tomorrow"
                          rows={2}
                          className="text-xs"
                        />
                        <div className="flex justify-between items-center gap-2">
                          <Input
                            name="followUpAt"
                            type="datetime-local"
                            defaultValue={enq.follow_up_at?.slice(0, 16) || ""}
                            className="h-7 text-xs w-auto"
                          />
                          <Button type="submit" size="sm" className="h-7 text-xs">
                            Save Note
                          </Button>
                        </div>
                      </form>
                    </details>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

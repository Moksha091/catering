export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BusinessRole = "owner" | "staff";
export type MembershipStatus = "invited" | "active" | "removed";
export type BusinessStatus = "active" | "suspended" | "deleted";

export type MenuStatus = "draft" | "published" | "archived";
export type DietaryType =
  | "veg"
  | "non_veg"
  | "vegan"
  | "egg"
  | "other"
  | "unspecified";

export type PriceType =
  | "fixed"
  | "per_person"
  | "market_rate"
  | "quote_required"
  | "hidden";

export type PackagePricingType =
  | "fixed"
  | "per_person"
  | "starting_from"
  | "quote_required";

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "quote_sent"
  | "converted"
  | "declined"
  | "closed";

export type EnquirySource =
  | "storefront"
  | "whatsapp"
  | "marketplace"
  | "manual"
  | "other";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "expired"
  | "superseded";

export type BookingStatus =
  | "pending_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_path: string | null;
  cover_image_path: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  address_text: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string;
  timezone: string;
  published: boolean;
  status: BusinessStatus;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: BusinessRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  business_id: string;
  city: string;
  locality: string | null;
  postal_code: string | null;
  travel_fee_paise: number;
  notes: string | null;
}

export interface Menu {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  menu_type: string | null;
  status: MenuStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  business_id: string;
  menu_id: string;
  name: string;
  description: string | null;
  display_order: number;
}

export interface MenuItem {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  dietary_type: DietaryType;
  price_type: PriceType;
  price_paise: number | null;
  unit_label: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  pricing_type: PackagePricingType;
  price_paise: number | null;
  minimum_guests: number | null;
  maximum_guests: number | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  business_id: string;
  package_id: string;
  menu_item_id: string | null;
  item_name_snapshot: string;
  quantity_or_description: string | null;
  display_order: number;
}

export interface Enquiry {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_type: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  guest_count: number | null;
  venue_address: string | null;
  city: string | null;
  selected_package_id: string | null;
  budget_min_paise: number | null;
  budget_max_paise: number | null;
  customer_notes: string | null;
  source: EnquirySource;
  status: EnquiryStatus;
  internal_notes: string | null;
  follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  business_id: string;
  enquiry_id: string;
  version: number;
  public_token_hash: string;
  currency: string;
  subtotal_paise: number;
  discount_paise: number;
  tax_paise: number;
  additional_charges_paise: number;
  total_paise: number;
  deposit_paise: number;
  notes: string | null;
  valid_until: string | null;
  status: QuoteStatus;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  business_id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price_paise: number;
  line_total_paise: number;
  display_order: number;
}

export interface Booking {
  id: string;
  business_id: string;
  enquiry_id: string | null;
  quote_id: string | null;
  booking_reference: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  guest_count: number | null;
  venue_address: string | null;
  agreed_total_paise: number;
  deposit_due_paise: number;
  balance_due_paise: number;
  status: BookingStatus;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  business_id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      businesses: {
        Row: Business;
        Insert: Omit<Business, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Business>;
      };
      business_members: {
        Row: BusinessMember;
        Insert: Omit<BusinessMember, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BusinessMember>;
      };
      service_areas: {
        Row: ServiceArea;
        Insert: Omit<ServiceArea, "id"> & { id?: string };
        Update: Partial<ServiceArea>;
      };
      menus: {
        Row: Menu;
        Insert: Omit<Menu, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Menu>;
      };
      menu_categories: {
        Row: MenuCategory;
        Insert: Omit<MenuCategory, "id"> & { id?: string };
        Update: Partial<MenuCategory>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<MenuItem>;
      };
      packages: {
        Row: Package;
        Insert: Omit<Package, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Package>;
      };
      package_items: {
        Row: PackageItem;
        Insert: Omit<PackageItem, "id"> & { id?: string };
        Update: Partial<PackageItem>;
      };
      enquiries: {
        Row: Enquiry;
        Insert: Omit<Enquiry, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Enquiry>;
      };
      quotes: {
        Row: Quote;
        Insert: Omit<Quote, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Quote>;
      };
      quote_items: {
        Row: QuoteItem;
        Insert: Omit<QuoteItem, "id"> & { id?: string };
        Update: Partial<QuoteItem>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Booking>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AuditLog>;
      };
    };
  };
}

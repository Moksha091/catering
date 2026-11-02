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
    };
  };
}

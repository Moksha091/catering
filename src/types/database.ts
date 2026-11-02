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
    };
  };
}

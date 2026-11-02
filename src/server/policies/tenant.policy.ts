import { SupabaseClient } from "@supabase/supabase-js";
import { BusinessMember, BusinessRole } from "@/types/database";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden: Insufficient tenant permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Validates that the currently authenticated user has an active membership
 * in the requested business, optionally checking for a minimum role (e.g. 'owner').
 */
export async function assertBusinessMembership(
  supabase: SupabaseClient,
  businessId: string,
  requiredRole?: BusinessRole
): Promise<BusinessMember> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("You must be logged in to perform this action");
  }

  const { data: member, error: memberError } = await supabase
    .from("business_members")
    .select("*")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (memberError || !member) {
    throw new ForbiddenError("You do not have access to this business");
  }

  if (requiredRole && member.role !== requiredRole && member.role !== "owner") {
    throw new ForbiddenError(
      `Action requires ${requiredRole} role for this business`
    );
  }

  return member as BusinessMember;
}

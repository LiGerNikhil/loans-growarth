export type Role = "PUBLIC" | "AGENT" | "MANAGER" | "SUPER_ADMIN";

export type Action =
  | "view_own_leads"
  | "view_all_leads"
  | "create_lead"
  | "update_lead_status"
  | "add_remark"
  | "schedule_follow_up"
  | "assign_lead"
  | "delete_lead"
  | "access_reports"
  | "export_data"
  | "manage_users"
  | "manage_system_settings"
  | "view_audit_logs"
  | "access_admin"
  | "manage_connectors";

const permissions: Record<Role, Action[]> = {
  PUBLIC: [],

  AGENT: [
    "view_own_leads",
    "create_lead",
    "update_lead_status",
    "add_remark",
    "schedule_follow_up",
  ],

  MANAGER: [
    "view_own_leads",
    "view_all_leads",
    "create_lead",
    "update_lead_status",
    "add_remark",
    "schedule_follow_up",
    "assign_lead",
    "access_reports",
    "export_data",
    "manage_connectors",
  ],

  SUPER_ADMIN: [
    "view_own_leads",
    "view_all_leads",
    "create_lead",
    "update_lead_status",
    "add_remark",
    "schedule_follow_up",
    "assign_lead",
    "delete_lead",
    "access_reports",
    "export_data",
    "manage_users",
    "manage_system_settings",
    "view_audit_logs",
    "access_admin",
    "manage_connectors",
  ],
};

export function can(role: Role | string, action: Action): boolean {
  const resolvedRole = role.toUpperCase() as Role;
  const allowed = permissions[resolvedRole];
  if (!allowed) return false;
  return allowed.includes(action);
}

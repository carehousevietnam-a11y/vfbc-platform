/**
 * Read-only listing of verify_fraud direct-input notes.
 * No on-screen list exists. This script is not run by the clean build.
 * It selects crm_activities for service_type verify_fraud and prints
 * meta keys ending in _detail, oldest first. It does not insert or update.
 *
 * Do not run against the production database unless Ace asks.
 */
console.log(
  [
    "No customer or admin screen lists fraud direct-input notes.",
    "Read-only query, not executed by this file on import:",
    "select leads.created_at, crm_activities.meta",
    "from crm_activities",
    "join leads on leads.id = crm_activities.lead_id",
    "where leads.service_type = 'verify_fraud'",
    "order by leads.created_at asc",
    "Then print meta entries whose key ends with _detail.",
  ].join("\n"),
);

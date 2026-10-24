/** Lead pipeline. A lead is "New" for 7 days; after that it moves to "Contact" on its own. */
export const NEW_DAYS = 7;
export const LEAD_STATUSES = ["new", "contact", "contacted", "won", "lost"] as const;
export const LEAD_LABELS: Record<string, string> = { new: "New", contact: "Contacts", contacted: "In conversation", won: "Customers", lost: "Lost" };
export const LEAD_HELP: Record<string, string> = { new: "Arrived in the last 7 days", contact: "Older than 7 days, nobody has followed up yet", contacted: "You are talking to them", won: "Became a customer", lost: "Not going ahead" };

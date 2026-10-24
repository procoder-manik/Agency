import { pgTable, serial, text, integer, boolean, jsonb, timestamp, customType } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });
const ts = (n: string) => timestamp(n, { withTimezone: true });
const stamps = {
  createdAt: ts("created_at").defaultNow().notNull(),
  updatedAt: ts("updated_at").defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("editor"),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

/** Every content collection (services, packages, team, projects, case studies, posts, pages, ...) lives here.
 *  Common columns are real columns; collection-specific fields live in `data` (JSONB), so adding a field
 *  never needs a migration. Field definitions are in lib/collections.ts. */
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  collection: text("collection").notNull(),
  slug: text("slug").notNull().default(""),
  title: text("title").notNull().default(""),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  builtin: boolean("builtin").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  data: jsonb("data").$type<Record<string, any>>().notNull().default({}),
  seo: jsonb("seo").$type<Record<string, any>>().notNull().default({}),
  publishedAt: ts("published_at"),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, any>>().notNull().default({}),
  ...stamps,
});

export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  builtin: boolean("builtin").notNull().default(false),
  tokens: jsonb("tokens").$type<Record<string, any>>().notNull(),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  data: bytea("data").notNull(),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const submissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id"),
  formName: text("form_name").notNull().default("Contact"),
  values: jsonb("values").$type<Record<string, any>>().notNull().default({}),
  read: boolean("read").notNull().default(false),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  company: text("company").notNull().default(""),
  source: text("source").notNull().default("website"),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  submissionId: integer("submission_id"),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: ts("verified_at"),
  unsubscribed: boolean("unsubscribed").notNull().default(false),
  token: text("token").notNull().default(""),
  contactCount: integer("contact_count").notNull().default(1),
  lastContactAt: ts("last_contact_at"),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull().default(""),
  preheader: text("preheader").notNull().default(""),
  html: text("html").notNull().default(""),
  blocks: jsonb("blocks").$type<Record<string, any> | null>(),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull().default(""),
  preheader: text("preheader").notNull().default(""),
  html: text("html").notNull().default(""),
  blocks: jsonb("blocks").$type<Record<string, any> | null>(),
  templateId: integer("template_id"),
  audience: jsonb("audience").$type<Record<string, any>>().notNull().default({}),
  status: text("status").notNull().default("draft"),
  total: integer("total").notNull().default(0),
  sent: integer("sent").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  cursorId: integer("cursor_id").notNull().default(0),
  startedAt: ts("started_at"),
  finishedAt: ts("finished_at"),
  deletedAt: ts("deleted_at"),
  ...stamps,
});

export const redirects = pgTable("redirects", {
  id: serial("id").primaryKey(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  type: integer("type").notNull().default(301),
  ...stamps,
});

export const notFoundLog = pgTable("not_found_log", {
  id: serial("id").primaryKey(),
  path: text("path").notNull().unique(),
  referrer: text("referrer").notNull().default(""),
  hits: integer("hits").notNull().default(1),
  lastSeen: ts("last_seen").defaultNow().notNull(),
  ...stamps,
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull().default(""),
  action: text("action").notNull(),
  target: text("target").notNull().default(""),
  ...stamps,
});

export const aiLog = pgTable("ai_log", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull().default(""),
  task: text("task").notNull(),
  provider: text("provider").notNull().default(""),
  model: text("model").notNull().default(""),
  summary: text("summary").notNull().default(""),
  ok: boolean("ok").notNull().default(true),
  ...stamps,
});

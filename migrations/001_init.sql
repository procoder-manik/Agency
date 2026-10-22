CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL DEFAULT '',
  password_hash text NOT NULL, role text NOT NULL DEFAULT 'editor', deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS entries (
  id serial PRIMARY KEY, collection text NOT NULL, slug text NOT NULL DEFAULT '', title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft', sort_order integer NOT NULL DEFAULT 0, builtin boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false, data jsonb NOT NULL DEFAULT '{}'::jsonb, seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at timestamptz, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entries_collection_idx ON entries (collection, status, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS entries_slug_uniq ON entries (collection, slug) WHERE deleted_at IS NULL AND slug <> '';
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS themes (
  id serial PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, builtin boolean NOT NULL DEFAULT false,
  tokens jsonb NOT NULL, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS media (
  id serial PRIMARY KEY, filename text NOT NULL, mime text NOT NULL, size integer NOT NULL DEFAULT 0,
  width integer, height integer, alt text NOT NULL DEFAULT '', data bytea NOT NULL, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS form_submissions (
  id serial PRIMARY KEY, form_id integer, form_name text NOT NULL DEFAULT 'Contact', values jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leads (
  id serial PRIMARY KEY, name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '', source text NOT NULL DEFAULT 'website', status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '', submission_id integer, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS redirects (
  id serial PRIMARY KEY, from_path text NOT NULL UNIQUE, to_path text NOT NULL, type integer NOT NULL DEFAULT 301,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS not_found_log (
  id serial PRIMARY KEY, path text NOT NULL UNIQUE, referrer text NOT NULL DEFAULT '', hits integer NOT NULL DEFAULT 1,
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_log (
  id serial PRIMARY KEY, user_email text NOT NULL DEFAULT '', action text NOT NULL, target text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ai_log (
  id serial PRIMARY KEY, user_email text NOT NULL DEFAULT '', task text NOT NULL, provider text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '', summary text NOT NULL DEFAULT '', ok boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

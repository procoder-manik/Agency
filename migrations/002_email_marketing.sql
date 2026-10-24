-- Leads: one row per unique email, verification, unsubscribe, contact counter
ALTER TABLE leads ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS unsubscribed boolean NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS token text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_count integer NOT NULL DEFAULT 1;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_at timestamptz;

-- Merge existing duplicate emails into the oldest lead, then soft-delete the extras
WITH d AS (
  SELECT lower(email) AS k, min(id) AS keep, count(*)::int AS n,
         string_agg(notes, E'\n\n---\n\n' ORDER BY id) FILTER (WHERE notes <> '') AS allnotes
  FROM leads WHERE deleted_at IS NULL AND email <> '' GROUP BY lower(email) HAVING count(*) > 1
)
UPDATE leads l SET contact_count = d.n, notes = COALESCE(d.allnotes, l.notes), last_contact_at = now()
FROM d WHERE l.id = d.keep;

UPDATE leads l SET deleted_at = now()
WHERE l.deleted_at IS NULL AND l.email <> ''
  AND l.id <> (SELECT min(x.id) FROM leads x WHERE x.deleted_at IS NULL AND lower(x.email) = lower(l.email));

UPDATE leads SET token = md5(random()::text || id::text || clock_timestamp()::text) || md5(clock_timestamp()::text || id::text || random()::text) WHERE token = '';
UPDATE leads SET last_contact_at = created_at WHERE last_contact_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_uniq ON leads (lower(email)) WHERE deleted_at IS NULL AND email <> '';
CREATE INDEX IF NOT EXISTS leads_token_idx ON leads (token);

-- Reusable HTML email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id serial PRIMARY KEY, name text NOT NULL, subject text NOT NULL DEFAULT '', preheader text NOT NULL DEFAULT '',
  html text NOT NULL DEFAULT '', deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campaigns (bulk sends to unique, verified leads)
CREATE TABLE IF NOT EXISTS campaigns (
  id serial PRIMARY KEY, name text NOT NULL, subject text NOT NULL DEFAULT '', preheader text NOT NULL DEFAULT '',
  html text NOT NULL DEFAULT '', template_id integer, audience jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft', total integer NOT NULL DEFAULT 0, sent integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0, cursor_id integer NOT NULL DEFAULT 0, started_at timestamptz, finished_at timestamptz,
  deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

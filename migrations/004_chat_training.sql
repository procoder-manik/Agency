-- Extra knowledge for the chat assistant: web pages (by link) and text notes added in Admin > Chat training
CREATE TABLE IF NOT EXISTS chat_sources (
  id serial PRIMARY KEY, kind text NOT NULL DEFAULT 'url', title text NOT NULL DEFAULT '', url text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'ok', error text NOT NULL DEFAULT '',
  fetched_at timestamptz, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS chat_sources_url_uniq ON chat_sources (url) WHERE deleted_at IS NULL AND kind = 'url' AND url <> '';

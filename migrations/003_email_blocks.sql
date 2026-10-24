-- Visual email builder: the block layout is stored next to the generated HTML so emails can be re-edited visually
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS blocks jsonb;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS blocks jsonb;

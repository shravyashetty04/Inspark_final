/*
# Create newsletter_subscribers and chatbot_conversations tables

1. New Tables
- `newsletter_subscribers`
  - `id` (uuid, primary key)
  - `email` (text, unique, not null) — subscriber's email address
  - `source` (text) — where they subscribed from (e.g. "footer")
  - `created_at` (timestamptz, default now())
- `chatbot_conversations`
  - `id` (uuid, primary key)
  - `session_id` (text, not null) — anonymous browser session identifier
  - `messages` (jsonb, not null) — array of {sender, text, timestamp} objects
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- `newsletter_subscribers`: allow anon + authenticated INSERT only (public signup, no sign-in).
  No SELECT/UPDATE/DELETE for anon — subscriber list is private to the business owner.
- `chatbot_conversations`: allow anon + authenticated INSERT only (public chatbot, no sign-in).
  No SELECT/UPDATE/DELETE for anon — conversations are private to the business owner.

3. Important Notes
- This is a no-auth marketing site. All public-facing policies use `TO anon, authenticated`
  so the anon-key frontend can write its own data.
- The business owner reads enquiries, subscribers, and conversations through the
  token-protected admin-enquiries edge function (service-role key), NOT through anon RLS.
- Index on newsletter_subscribers.email for duplicate-check lookups.
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);

ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_chatbot" ON chatbot_conversations;
CREATE POLICY "anon_insert_chatbot" ON chatbot_conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

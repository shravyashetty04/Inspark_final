/*
# Create enquiries table for contact form submissions

1. New Tables
- `enquiries`
  - `id` (uuid, primary key)
  - `name` (text, not null) — submitter's full name
  - `email` (text, not null) — submitter's email address
  - `phone` (text) — submitter's phone number
  - `service` (text) — which service they're interested in
  - `message` (text, not null) — project overview / requirements
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `enquiries`.
- Allow anon + authenticated INSERT only (public contact form, no sign-in).
- No SELECT/UPDATE/DELETE for anon — enquiries are private to the business owner.
*/

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_enquiries" ON enquiries;
CREATE POLICY "anon_insert_enquiries" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
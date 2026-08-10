-- ============================================
-- E-Voting OSIS - Row Level Security (RLS)
-- Run AFTER schema.sql and rpc.sql
-- ============================================

-- Enable RLS on all tables (default deny for public access)
ALTER TABLE voters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes      ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CANDIDATES: Allow public SELECT (displayed in voting booth)
-- =============================================
CREATE POLICY "Allow public read candidates"
  ON candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =============================================
-- VOTES: Allow anon INSERT for realtime (via service role only via API)
-- Allow SELECT for realtime subscription (dashboard)
-- =============================================
CREATE POLICY "Allow realtime read votes"
  ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =============================================
-- VOTERS: No public access
-- All operations go through service_role (API routes)
-- =============================================
-- No public policies for voters table = fully locked

-- =============================================
-- NOTE: All write operations (INSERT, UPDATE) to voters and votes
-- must use SUPABASE_SERVICE_ROLE_KEY in API routes.
-- The anon/public key cannot write to these tables.
-- =============================================

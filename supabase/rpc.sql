-- ============================================
-- E-Voting OSIS - Stored Procedure (RPC)
-- Run AFTER schema.sql
-- ============================================

-- RPC: submit_vote
-- Atomic transaction: update has_voted + insert vote
-- Prevents double-voting at database level (handles race conditions)
CREATE OR REPLACE FUNCTION submit_vote(p_nisn TEXT, p_candidate_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_voted BOOLEAN;
BEGIN
  -- Lock the voter row to prevent race conditions
  SELECT has_voted INTO v_has_voted
  FROM voters
  WHERE nisn = p_nisn
  FOR UPDATE;

  -- Check if voter exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'VOTER_NOT_FOUND';
  END IF;

  -- Check if already voted
  IF v_has_voted THEN
    RAISE EXCEPTION 'ALREADY_VOTED';
  END IF;

  -- Mark voter as having voted
  UPDATE voters SET has_voted = TRUE WHERE nisn = p_nisn;

  -- Insert the anonymous vote
  INSERT INTO votes (candidate_id) VALUES (p_candidate_id);
END;
$$;

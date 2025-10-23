-- Allow direct profile ratings without requiring a claim
-- This enables users to rate each other's profiles directly

CREATE POLICY "Users can rate profiles directly"
ON public.ratings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = rater_user_id 
  AND auth.uid() != rated_user_id
  AND claim_id = '00000000-0000-0000-0000-000000000000'::uuid
);
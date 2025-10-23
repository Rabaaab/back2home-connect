-- Fix foreign key constraint issue for direct profile ratings
-- Make claim_id nullable and use NULL instead of dummy UUID

-- Drop the existing RLS policy
DROP POLICY IF EXISTS "Users can rate profiles directly" ON public.ratings;

-- Create new policy that allows NULL claim_id for direct ratings
CREATE POLICY "Users can rate profiles directly"
ON public.ratings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = rater_user_id 
  AND auth.uid() != rated_user_id
  AND claim_id IS NULL
);

-- Update the unique constraint to handle NULL values properly
-- First drop the old constraint
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS unique_direct_rating;

-- Add new constraint that only applies when claim_id IS NULL
CREATE UNIQUE INDEX unique_direct_rating 
ON public.ratings (rater_user_id, rated_user_id) 
WHERE claim_id IS NULL;
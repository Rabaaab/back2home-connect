-- Fix 1: Restrict profile visibility to authenticated users only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Add unique constraint to prevent rating manipulation
ALTER TABLE public.ratings 
ADD CONSTRAINT unique_direct_rating 
UNIQUE (rater_user_id, rated_user_id, claim_id);
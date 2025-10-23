-- Create ratings table for user-to-user ratings
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL UNIQUE REFERENCES public.claims(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(claim_id, rater_user_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view ratings for any user (to calculate averages)
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings FOR SELECT
USING (true);

-- Policy: Authenticated users can create ratings for claims they were involved in
CREATE POLICY "Users can rate after claiming"
ON public.ratings FOR INSERT
WITH CHECK (
  auth.uid() = rater_user_id AND
  EXISTS (
    SELECT 1 FROM public.claims
    WHERE claims.id = claim_id
    AND (claims.claimer_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.posts WHERE posts.id = claims.post_id AND posts.user_id = auth.uid()))
  )
);

-- Policy: Users cannot update or delete ratings once created
-- (to maintain rating integrity)

-- Create index for faster rating queries
CREATE INDEX idx_ratings_rated_user ON public.ratings(rated_user_id);
CREATE INDEX idx_ratings_claim ON public.ratings(claim_id);
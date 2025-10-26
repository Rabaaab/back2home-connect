-- Allow direct profile ratings by making claim_id optional
ALTER TABLE public.ratings
ALTER COLUMN claim_id DROP NOT NULL;

-- Optional: add an index to speed up lookups by rated_user_id
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON public.ratings(rated_user_id);

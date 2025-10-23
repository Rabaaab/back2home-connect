-- Create badges table
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at timestamp with time zone NOT NULL DEFAULT now(),
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT
USING (true);

-- RLS Policies for user_badges
CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges FOR SELECT
USING (true);

CREATE POLICY "System can insert user badges"
ON public.user_badges FOR INSERT
WITH CHECK (true);

-- Insert default solidarity badge
INSERT INTO public.badges (name, description, icon)
VALUES ('Solidarité', 'Décerné pour avoir restitué un objet trouvé', '🤝');

-- Function to award badge when post is resolved
CREATE OR REPLACE FUNCTION public.award_solidarity_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  solidarity_badge_id uuid;
BEGIN
  -- Check if post is marked as resolved and type is 'found'
  IF NEW.is_resolved = true AND NEW.type = 'found' AND (OLD.is_resolved = false OR OLD.is_resolved IS NULL) THEN
    -- Get solidarity badge id
    SELECT id INTO solidarity_badge_id FROM public.badges WHERE name = 'Solidarité' LIMIT 1;
    
    -- Award badge to user (insert only if not already awarded)
    INSERT INTO public.user_badges (user_id, badge_id, post_id)
    VALUES (NEW.user_id, solidarity_badge_id, NEW.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to award badge
CREATE TRIGGER award_badge_on_resolution
AFTER UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.award_solidarity_badge();
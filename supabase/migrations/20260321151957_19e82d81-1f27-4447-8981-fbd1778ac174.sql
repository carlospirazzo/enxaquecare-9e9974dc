-- Create episodes table
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  pain_level TEXT NOT NULL CHECK (pain_level IN ('light', 'moderate', 'severe')),
  medications JSONB NOT NULL DEFAULT '[]',
  is_menstrual BOOLEAN NOT NULL DEFAULT false,
  symptoms JSONB NOT NULL DEFAULT '[]',
  triggers JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  sleep JSONB,
  wellbeing JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own episodes"
  ON public.episodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episodes"
  ON public.episodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes"
  ON public.episodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes"
  ON public.episodes FOR DELETE
  USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_episodes_user_date ON public.episodes(user_id, date);

-- Create claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  claim_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- AI analysis results
  damage_severity TEXT,
  damage_description TEXT,
  estimated_cost NUMERIC,
  cost_breakdown JSONB,
  fraud_risk TEXT,
  fraud_details TEXT,
  confidence_score NUMERIC,
  ocr_extracted_data JSONB,
  ai_report TEXT,
  ai_recommendation TEXT,
  processing_time_ms INTEGER
);

-- Create claim_files table
CREATE TABLE public.claim_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage bucket for claim files
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-files', 'claim-files', false);

-- RLS for claims table
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON public.claims FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own claims"
  ON public.claims FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own claims"
  ON public.claims FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS for claim_files table
ALTER TABLE public.claim_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claim files"
  ON public.claim_files FOR SELECT TO authenticated
  USING (claim_id IN (SELECT id FROM public.claims WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert claim files"
  ON public.claim_files FOR INSERT TO authenticated
  WITH CHECK (claim_id IN (SELECT id FROM public.claims WHERE user_id = auth.uid()));

-- Storage RLS policies
CREATE POLICY "Users can upload claim files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'claim-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own claim files storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'claim-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role can read all files (for edge function)
CREATE POLICY "Service role can read all claim files"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'claim-files');

-- Generate claim number function
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.claim_number := 'CLM-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_claim_number
  BEFORE INSERT ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_claim_number();

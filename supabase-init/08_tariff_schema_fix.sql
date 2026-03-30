-- ============================================
-- Fix missing tariff data schema
-- Adds: usage_group, unit, tax_advantages columns
-- Creates: tariff_rangees table
-- Creates: search_tariff_codes() RPC function
-- ============================================

-- A) Add missing columns to tariff_codes
ALTER TABLE public.tariff_codes ADD COLUMN IF NOT EXISTS usage_group TEXT;
ALTER TABLE public.tariff_codes ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.tariff_codes ADD COLUMN IF NOT EXISTS tax_advantages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tariff_codes ADD COLUMN IF NOT EXISTS designation TEXT;

-- Index on usage_group for filtering
CREATE INDEX IF NOT EXISTS idx_tariff_codes_usage_group ON public.tariff_codes(usage_group);

-- B) Create tariff_rangees table (ranges within chapters)
CREATE TABLE IF NOT EXISTS public.tariff_rangees (
  id SERIAL PRIMARY KEY,
  section_code TEXT NOT NULL REFERENCES public.tariff_sections(code),
  chapitre_code TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (section_code, chapitre_code, code)
);

ALTER TABLE public.tariff_rangees ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read tariff rangees" ON public.tariff_rangees
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage tariff rangees" ON public.tariff_rangees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- C) Create search_tariff_codes() RPC function
--    Used by /api/tariff/search route
CREATE OR REPLACE FUNCTION public.search_tariff_codes(
  search_query TEXT,
  translated_query TEXT DEFAULT NULL,
  section_filter TEXT DEFAULT NULL,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id INT,
  full_code TEXT,
  section_code TEXT,
  chapitre_code TEXT,
  range_code TEXT,
  position_code TEXT,
  description TEXT,
  dd NUMERIC(6,2),
  prct NUMERIC(6,2),
  tcs NUMERIC(6,2),
  tva NUMERIC(6,2),
  dap NUMERIC(6,2),
  other_taxes JSONB,
  usage_group TEXT,
  unit TEXT,
  tax_advantages JSONB,
  designation TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total BIGINT;
BEGIN
  -- Count total matching results
  -- Searches both the original query and the translated (French) query via FTS
  SELECT COUNT(*) INTO total
  FROM public.tariff_codes tc
  WHERE
    (section_filter IS NULL OR tc.section_code = section_filter)
    AND (
      tc.full_code ILIKE '%' || search_query || '%'
      OR to_tsvector('french', tc.description) @@ plainto_tsquery('french', search_query)
      OR (translated_query IS NOT NULL AND to_tsvector('french', tc.description) @@ plainto_tsquery('french', translated_query))
    );

  RETURN QUERY
  SELECT
    tc.id,
    tc.full_code,
    tc.section_code,
    tc.chapitre_code,
    tc.range_code,
    tc.position_code,
    tc.description,
    tc.dd,
    tc.prct,
    tc.tcs,
    tc.tva,
    tc.dap,
    tc.other_taxes,
    tc.usage_group,
    tc.unit,
    tc.tax_advantages,
    tc.designation,
    tc.created_at,
    tc.updated_at,
    -- Ranking: exact code prefix > partial code > translated FTS > original FTS
    CASE
      WHEN tc.full_code ILIKE search_query || '%' THEN 1.0
      WHEN tc.full_code ILIKE '%' || search_query || '%' THEN 0.8
      WHEN translated_query IS NOT NULL AND to_tsvector('french', tc.description) @@ plainto_tsquery('french', translated_query)
        THEN ts_rank(to_tsvector('french', tc.description), plainto_tsquery('french', translated_query))
      WHEN to_tsvector('french', tc.description) @@ plainto_tsquery('french', search_query)
        THEN ts_rank(to_tsvector('french', tc.description), plainto_tsquery('french', search_query))
      ELSE 0.0
    END::REAL AS rank,
    total AS total_count
  FROM public.tariff_codes tc
  WHERE
    (section_filter IS NULL OR tc.section_code = section_filter)
    AND (
      tc.full_code ILIKE '%' || search_query || '%'
      OR to_tsvector('french', tc.description) @@ plainto_tsquery('french', search_query)
      OR (translated_query IS NOT NULL AND to_tsvector('french', tc.description) @@ plainto_tsquery('french', translated_query))
    )
  ORDER BY rank DESC, tc.full_code ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

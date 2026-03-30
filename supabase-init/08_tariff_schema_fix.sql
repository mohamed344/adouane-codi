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

-- C) Trigram index on full_code for fast ILIKE searches
CREATE INDEX IF NOT EXISTS idx_tariff_codes_full_code_trgm
ON public.tariff_codes USING gin (full_code gin_trgm_ops);

-- D) Create search_tariff_codes() RPC function
--    Used by /api/tariff/search route
--    Optimized: single pass with count(*) OVER(), pre-computed tsqueries
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
  q_tsquery TSQUERY;
  tq_tsquery TSQUERY;
BEGIN
  -- Pre-compute tsqueries once
  q_tsquery := plainto_tsquery('french', search_query);
  IF translated_query IS NOT NULL THEN
    tq_tsquery := plainto_tsquery('french', translated_query);
  END IF;

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
    CASE
      WHEN tc.full_code LIKE search_query || '%' THEN 1.0
      WHEN tc.full_code ILIKE '%' || search_query || '%' THEN 0.8
      WHEN tq_tsquery IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_tsquery
        THEN ts_rank(to_tsvector('french', tc.description), tq_tsquery)
      WHEN to_tsvector('french', tc.description) @@ q_tsquery
        THEN ts_rank(to_tsvector('french', tc.description), q_tsquery)
      ELSE 0.0
    END::REAL AS rank,
    count(*) OVER()::BIGINT AS total_count
  FROM public.tariff_codes tc
  WHERE
    (section_filter IS NULL OR tc.section_code = section_filter)
    AND (
      tc.full_code ILIKE '%' || search_query || '%'
      OR to_tsvector('french', tc.description) @@ q_tsquery
      OR (tq_tsquery IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_tsquery)
    )
  ORDER BY rank DESC, tc.full_code ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- E) Single tariff detail lookup with JOINs (replaces 4 separate queries)
CREATE OR REPLACE FUNCTION public.get_tariff_detail(tariff_code TEXT)
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
  section_code_val TEXT,
  section_desc TEXT,
  chapitre_code_val TEXT,
  chapitre_desc TEXT,
  rangee_code_val TEXT,
  rangee_desc TEXT
)
LANGUAGE sql
STABLE
AS $$
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
    ts.code AS section_code_val,
    ts.description AS section_desc,
    tch.code AS chapitre_code_val,
    tch.description AS chapitre_desc,
    tr.code AS rangee_code_val,
    tr.description AS rangee_desc
  FROM public.tariff_codes tc
  LEFT JOIN public.tariff_sections ts ON ts.code = tc.section_code
  LEFT JOIN public.tariff_chapitres tch ON tch.section_code = tc.section_code AND tch.code = tc.chapitre_code
  LEFT JOIN public.tariff_rangees tr ON tr.section_code = tc.section_code AND tr.chapitre_code = tc.chapitre_code AND tr.code = tc.range_code
  WHERE tc.full_code = tariff_code
  LIMIT 1;
$$;

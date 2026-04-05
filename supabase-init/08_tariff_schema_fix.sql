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
ALTER TABLE public.tariff_codes ADD COLUMN IF NOT EXISTS cle TEXT;

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

-- C2) GIN indexes for searching designation and parent tables
CREATE INDEX IF NOT EXISTS idx_tariff_codes_designation_fts
  ON public.tariff_codes USING gin(to_tsvector('french', COALESCE(designation, '')));
CREATE INDEX IF NOT EXISTS idx_tariff_chapitres_description_fts
  ON public.tariff_chapitres USING gin(to_tsvector('french', description));
CREATE INDEX IF NOT EXISTS idx_tariff_rangees_description_fts
  ON public.tariff_rangees USING gin(to_tsvector('french', description));
CREATE INDEX IF NOT EXISTS idx_tariff_codes_designation_trgm
  ON public.tariff_codes USING gin (COALESCE(designation, '') gin_trgm_ops);

-- D) Create search_tariff_codes() RPC function
--    Used by /api/tariff/search route
--    Searches description + designation via GIN indexes (no CTE, no combined tsvector)
--    OR-based fallback for multi-word queries (any word matches)
--    JOINs rangee/chapitre for display only, not for filtering
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
  total_count BIGINT,
  rangee_description TEXT,
  chapitre_description TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  q_tsquery TSQUERY;
  tq_tsquery TSQUERY;
  q_plain TSQUERY;
  tq_plain TSQUERY;
  q_or TSQUERY;
  tq_or TSQUERY;
  or_parts TEXT[];
  part_text TEXT;
  w TEXT;
BEGIN
  q_tsquery := websearch_to_tsquery('french', search_query);
  q_plain := plainto_tsquery('french', search_query);

  -- Build OR-based tsquery: filter out stop words that produce empty tsqueries
  or_parts := ARRAY[]::TEXT[];
  FOR w IN SELECT unnest(string_to_array(trim(search_query), ' '))
  LOOP
    IF length(trim(w)) >= 2 THEN
      part_text := plainto_tsquery('french', w)::text;
      IF part_text IS NOT NULL AND part_text != '' THEN
        or_parts := or_parts || part_text;
      END IF;
    END IF;
  END LOOP;

  IF array_length(or_parts, 1) > 0 THEN
    q_or := array_to_string(or_parts, ' | ')::tsquery;
  ELSE
    q_or := q_plain;
  END IF;

  IF translated_query IS NOT NULL THEN
    tq_tsquery := websearch_to_tsquery('french', translated_query);
    tq_plain := plainto_tsquery('french', translated_query);

    or_parts := ARRAY[]::TEXT[];
    FOR w IN SELECT unnest(string_to_array(trim(translated_query), ' '))
    LOOP
      IF length(trim(w)) >= 2 THEN
        part_text := plainto_tsquery('french', w)::text;
        IF part_text IS NOT NULL AND part_text != '' THEN
          or_parts := or_parts || part_text;
        END IF;
      END IF;
    END LOOP;

    IF array_length(or_parts, 1) > 0 THEN
      tq_or := array_to_string(or_parts, ' | ')::tsquery;
    ELSE
      tq_or := tq_plain;
    END IF;
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
      WHEN tc.full_code ILIKE '%' || search_query || '%' THEN 0.9
      -- All words match description (highest text rank)
      WHEN to_tsvector('french', tc.description) @@ q_tsquery
        THEN 0.7 + ts_rank(to_tsvector('french', tc.description), q_tsquery) * 0.3
      WHEN tq_tsquery IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_tsquery
        THEN 0.7 + ts_rank(to_tsvector('french', tc.description), tq_tsquery) * 0.3
      -- All words match designation
      WHEN to_tsvector('french', COALESCE(tc.designation, '')) @@ q_tsquery
        THEN 0.5 + ts_rank(to_tsvector('french', COALESCE(tc.designation, '')), q_tsquery) * 0.3
      WHEN tq_tsquery IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_tsquery
        THEN 0.5 + ts_rank(to_tsvector('french', COALESCE(tc.designation, '')), tq_tsquery) * 0.3
      -- Any word matches description or designation (OR)
      WHEN to_tsvector('french', tc.description) @@ q_or
        THEN 0.3 + ts_rank(to_tsvector('french', tc.description), q_or) * 0.2
      WHEN to_tsvector('french', COALESCE(tc.designation, '')) @@ q_or
        THEN 0.2 + ts_rank(to_tsvector('french', COALESCE(tc.designation, '')), q_or) * 0.2
      WHEN tq_or IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_or
        THEN 0.3 + ts_rank(to_tsvector('french', tc.description), tq_or) * 0.2
      WHEN tq_or IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_or
        THEN 0.2 + ts_rank(to_tsvector('french', COALESCE(tc.designation, '')), tq_or) * 0.2
      -- ILIKE fallbacks
      WHEN lower(COALESCE(tc.designation, '')) LIKE '%' || lower(search_query) || '%' THEN 0.15
      WHEN lower(tc.description) LIKE '%' || lower(search_query) || '%' THEN 0.1
      ELSE 0.05
    END::REAL AS rank,
    count(*) OVER()::BIGINT AS total_count,
    tr.description,
    tch.description
  FROM public.tariff_codes tc
  LEFT JOIN public.tariff_rangees tr
    ON tr.section_code = tc.section_code
    AND tr.chapitre_code = tc.chapitre_code
    AND tr.code = tc.range_code
  LEFT JOIN public.tariff_chapitres tch
    ON tch.section_code = tc.section_code
    AND tch.code = tc.chapitre_code
  WHERE
    (section_filter IS NULL OR tc.section_code = section_filter)
    AND (
      tc.full_code ILIKE '%' || search_query || '%'
      -- description FTS (uses GIN index)
      OR to_tsvector('french', tc.description) @@ q_tsquery
      OR to_tsvector('french', tc.description) @@ q_plain
      OR to_tsvector('french', tc.description) @@ q_or
      -- designation FTS (uses GIN index)
      OR to_tsvector('french', COALESCE(tc.designation, '')) @@ q_tsquery
      OR to_tsvector('french', COALESCE(tc.designation, '')) @@ q_plain
      OR to_tsvector('french', COALESCE(tc.designation, '')) @@ q_or
      -- translated query FTS
      OR (tq_tsquery IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_tsquery)
      OR (tq_tsquery IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_tsquery)
      OR (tq_plain IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_plain)
      OR (tq_plain IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_plain)
      OR (tq_or IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_or)
      OR (tq_or IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_or)
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
  cle TEXT,
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
    tc.cle,
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

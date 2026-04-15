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

-- D) Drop old overloaded version (4-param) to avoid Postgres ambiguity
DROP FUNCTION IF EXISTS public.search_tariff_codes(text, text, int, int);

-- Trigram index for fuzzy/typo search on description
CREATE INDEX IF NOT EXISTS idx_tariff_codes_description_trgm_lower
  ON public.tariff_codes USING gin (lower(description) gin_trgm_ops);

-- Create search_tariff_codes() RPC function
--    AND-based matching: all words must match when possible
--    Falls back to first keyword only (never OR — adding words must not expand results)
--    Fuzzy trigram fallback for typos when FTS finds nothing
CREATE OR REPLACE FUNCTION public.search_tariff_codes(
  search_query TEXT,
  translated_query TEXT DEFAULT NULL,
  section_filter TEXT DEFAULT NULL,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id INT, full_code TEXT, section_code TEXT, chapitre_code TEXT,
  range_code TEXT, position_code TEXT, description TEXT,
  dd NUMERIC(6,2), prct NUMERIC(6,2), tcs NUMERIC(6,2),
  tva NUMERIC(6,2), dap NUMERIC(6,2), other_taxes JSONB,
  usage_group TEXT, unit TEXT, tax_advantages JSONB, designation TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  rank REAL, total_count BIGINT,
  rangee_description TEXT, chapitre_description TEXT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  q_tsquery TSQUERY; tq_tsquery TSQUERY;
  q_plain TSQUERY; tq_plain TSQUERY;
  q_and TSQUERY; tq_and TSQUERY;
  q_first TSQUERY; tq_first TSQUERY;
  and_parts TEXT[]; part_text TEXT; w TEXT;
  word_count INT;
  has_and_results BOOLEAN;
  has_any_fts_results BOOLEAN;
BEGIN
  q_tsquery := websearch_to_tsquery('french', search_query);
  q_plain := plainto_tsquery('french', search_query);

  -- Build AND query parts from individual words
  and_parts := ARRAY[]::TEXT[];
  q_first := NULL;
  FOR w IN SELECT unnest(string_to_array(trim(search_query), ' ')) LOOP
    IF length(trim(w)) >= 2 THEN
      part_text := plainto_tsquery('french', w)::text;
      IF part_text IS NOT NULL AND part_text != '' THEN
        and_parts := and_parts || part_text;
        IF q_first IS NULL THEN q_first := plainto_tsquery('french', w); END IF;
      END IF;
    END IF;
  END LOOP;

  word_count := coalesce(array_length(and_parts, 1), 0);
  IF word_count > 1 THEN q_and := array_to_string(and_parts, ' & ')::tsquery;
  ELSIF word_count = 1 THEN q_and := and_parts[1]::tsquery;
  ELSE q_and := q_plain; END IF;
  IF q_first IS NULL THEN q_first := q_plain; END IF;

  -- Strict AND: all words must match, no fallback
  has_and_results := TRUE;

  -- Handle translated query
  tq_first := NULL; tq_and := NULL; tq_tsquery := NULL; tq_plain := NULL;
  IF translated_query IS NOT NULL THEN
    tq_tsquery := websearch_to_tsquery('french', translated_query);
    tq_plain := plainto_tsquery('french', translated_query);
    and_parts := ARRAY[]::TEXT[];
    FOR w IN SELECT unnest(string_to_array(trim(translated_query), ' ')) LOOP
      IF length(trim(w)) >= 2 THEN
        part_text := plainto_tsquery('french', w)::text;
        IF part_text IS NOT NULL AND part_text != '' THEN
          and_parts := and_parts || part_text;
          IF tq_first IS NULL THEN tq_first := plainto_tsquery('french', w); END IF;
        END IF;
      END IF;
    END LOOP;
    IF array_length(and_parts, 1) > 1 THEN tq_and := array_to_string(and_parts, ' & ')::tsquery;
    ELSIF array_length(and_parts, 1) = 1 THEN tq_and := and_parts[1]::tsquery;
    ELSE tq_and := tq_plain; END IF;

  END IF;

  -- Check if any FTS result exists (for fuzzy fallback decision)
  SELECT EXISTS(SELECT 1 FROM public.tariff_codes tc
    WHERE (section_filter IS NULL OR tc.section_code = section_filter)
      AND (tc.full_code ILIKE '%' || search_query || '%'
        OR to_tsvector('french', tc.description) @@ q_and
        OR to_tsvector('french', COALESCE(tc.designation, '')) @@ q_and
        OR (tq_and IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_and)
        OR (tq_and IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_and))
    LIMIT 1) INTO has_any_fts_results;

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
      -- Exact code match
      WHEN tc.full_code LIKE search_query || '%' THEN 1.0
      WHEN tc.full_code ILIKE '%' || search_query || '%' THEN 0.9
      -- AND match on description (q_and is best progressive subset)
      WHEN to_tsvector('french', tc.description) @@ q_and THEN 0.8 + ts_rank(to_tsvector('french', tc.description), q_and) * 0.2
      WHEN tq_and IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_and THEN 0.8 + ts_rank(to_tsvector('french', tc.description), tq_and) * 0.2
      -- AND match on designation
      WHEN to_tsvector('french', COALESCE(tc.designation, '')) @@ q_and THEN 0.6 + ts_rank(to_tsvector('french', COALESCE(tc.designation, '')), q_and) * 0.2
      WHEN tq_and IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_and THEN 0.6 + ts_rank(to_tsvector('french', COALESCE(tc.designation, '')), tq_and) * 0.2
      -- Fuzzy trigram (typo tolerance — only when FTS found nothing)
      WHEN NOT has_any_fts_results AND word_similarity(lower(search_query), lower(tc.description)) > 0.45 THEN 0.1 + word_similarity(lower(search_query), lower(tc.description)) * 0.15
      WHEN NOT has_any_fts_results AND word_similarity(lower(search_query), lower(COALESCE(tc.designation, ''))) > 0.45 THEN 0.08 + word_similarity(lower(search_query), lower(COALESCE(tc.designation, ''))) * 0.15
      WHEN lower(COALESCE(tc.designation, '')) LIKE '%' || lower(search_query) || '%' THEN 0.15
      WHEN lower(tc.description) LIKE '%' || lower(search_query) || '%' THEN 0.1
      ELSE 0.05
    END::REAL AS rank,
    count(*) OVER()::BIGINT AS total_count,
    tr.description, tch.description
  FROM public.tariff_codes tc
  LEFT JOIN public.tariff_rangees tr ON tr.section_code = tc.section_code AND tr.chapitre_code = tc.chapitre_code AND tr.code = tc.range_code
  LEFT JOIN public.tariff_chapitres tch ON tch.section_code = tc.section_code AND tch.code = tc.chapitre_code
  WHERE (section_filter IS NULL OR tc.section_code = section_filter)
    AND (
      tc.full_code ILIKE '%' || search_query || '%'
      -- AND match (q_and is best progressive subset that has results)
      OR to_tsvector('french', tc.description) @@ q_and
      OR to_tsvector('french', COALESCE(tc.designation, '')) @@ q_and
      -- Translated AND match
      OR (tq_and IS NOT NULL AND to_tsvector('french', tc.description) @@ tq_and)
      OR (tq_and IS NOT NULL AND to_tsvector('french', COALESCE(tc.designation, '')) @@ tq_and)
      -- Fuzzy fallback (typos — only when FTS found nothing)
      OR (NOT has_any_fts_results AND length(search_query) >= 4 AND word_similarity(lower(search_query), lower(tc.description)) > 0.45)
      OR (NOT has_any_fts_results AND length(search_query) >= 4 AND word_similarity(lower(search_query), lower(COALESCE(tc.designation, ''))) > 0.45)
    )
  ORDER BY rank DESC, tc.full_code ASC
  LIMIT result_limit OFFSET result_offset;
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

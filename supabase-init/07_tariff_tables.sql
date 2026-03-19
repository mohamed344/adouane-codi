-- ============================================
-- Algerian Customs Tariff (Nomenclature Douanière 2026)
-- Tables for tariff data scraped from douane.gov.dz
-- ============================================

-- 1. Sections (21 sections)
CREATE TABLE IF NOT EXISTS public.tariff_sections (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tariff_sections ENABLE ROW LEVEL SECURITY;

-- Public read access (tariff data is public info)
CREATE POLICY "Anyone can read tariff sections" ON public.tariff_sections
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage tariff sections" ON public.tariff_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Chapitres (chapters within sections)
CREATE TABLE IF NOT EXISTS public.tariff_chapitres (
  id SERIAL PRIMARY KEY,
  section_code TEXT NOT NULL REFERENCES public.tariff_sections(code),
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (section_code, code)
);

ALTER TABLE public.tariff_chapitres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tariff chapitres" ON public.tariff_chapitres
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tariff chapitres" ON public.tariff_chapitres
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Tariff codes (the main data table)
CREATE TABLE IF NOT EXISTS public.tariff_codes (
  id SERIAL PRIMARY KEY,
  full_code TEXT UNIQUE NOT NULL,         -- e.g. "0101211100" (10-digit)
  section_code TEXT NOT NULL,
  chapitre_code TEXT NOT NULL,
  range_code TEXT NOT NULL,
  position_code TEXT NOT NULL,
  description TEXT NOT NULL,              -- French description
  dd NUMERIC(6,2),                        -- Droit de Douane %
  prct NUMERIC(6,2),                      -- PRCT %
  tcs NUMERIC(6,2),                       -- Taxe Complémentaire de Solidarité %
  tva NUMERIC(6,2),                       -- TVA %
  dap NUMERIC(6,2),                       -- DAP %
  other_taxes JSONB DEFAULT '[]'::jsonb,  -- Other taxes if any
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tariff_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tariff codes" ON public.tariff_codes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tariff codes" ON public.tariff_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tariff_codes_full_code ON public.tariff_codes(full_code);
CREATE INDEX IF NOT EXISTS idx_tariff_codes_section ON public.tariff_codes(section_code);
CREATE INDEX IF NOT EXISTS idx_tariff_codes_chapitre ON public.tariff_codes(section_code, chapitre_code);
CREATE INDEX IF NOT EXISTS idx_tariff_codes_description ON public.tariff_codes USING gin(to_tsvector('french', description));

-- Full-text search function
CREATE OR REPLACE FUNCTION search_tariff(search_query TEXT)
RETURNS SETOF public.tariff_codes
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.tariff_codes
  WHERE
    full_code ILIKE '%' || search_query || '%'
    OR to_tsvector('french', description) @@ plainto_tsquery('french', search_query)
  ORDER BY full_code
  LIMIT 50;
$$;

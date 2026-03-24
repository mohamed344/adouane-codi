import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedDescription } from "@/lib/tariff-translations";

/** Strip leading dash/space prefixes like "- - - Des types..." → "Des types..." */
function cleanDescription(text: string | null): string | null {
  if (!text) return text;
  return text.replace(/^[-\s]+/, "").trim();
}

/**
 * GET /api/tariff/search?q=lait&lang=fr
 * Search tariff codes by keyword or code number across all languages
 * Uses PostgreSQL full-text search with ranking for Google-like results
 *
 * Query params:
 *   q       - search query (required, min 2 chars)
 *   section - filter by section code
 *   lang    - language for description display (en, fr, ar) default: fr
 *   page    - page number (default: 1)
 *   limit   - results per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const sectionCode = searchParams.get("section");
  const lang = searchParams.get("lang") || "fr";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required (min 2 characters)" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Use the search function for ranked results
  const { data, error } = await supabase.rpc("search_tariff_codes", {
    search_query: query,
    section_filter: sectionCode || null,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = data?.[0]?.total_count ?? 0;
  const totalPages = Math.ceil(Number(total) / limit);

  // Map results with localized descriptions (translated on-the-fly)
  const results = (data || []).map((item: Record<string, unknown>) => {
    const localized = getLocalizedDescription(
      item.description as string,
      item.description_en as string | null,
      item.description_ar as string | null,
      lang
    );

    return {
      full_code: item.full_code,
      section_code: item.section_code,
      chapitre_code: item.chapitre_code,
      description: cleanDescription(item.description as string),
      description_en: cleanDescription(item.description_en as string | null),
      description_ar: cleanDescription(item.description_ar as string | null),
      display_description: cleanDescription(localized.text) || localized.text,
      display_lang: localized.lang,
      dd: item.dd,
      prct: item.prct,
      tcs: item.tcs,
      tva: item.tva,
      dap: item.dap,
      rank: item.rank,
    };
  });

  return NextResponse.json({
    data: results,
    query,
    lang,
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

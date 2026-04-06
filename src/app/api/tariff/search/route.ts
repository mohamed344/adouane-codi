import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reverseTranslateQuery } from "@/lib/tariff-translations";
import { getGeminiClient } from "@/lib/gemini";

/** Strip leading dash/space prefixes like "- - - Des types..." → "Des types..." */
function cleanDescription(text: string | null): string | null {
  if (!text) return text;
  return text.replace(/^[-\s]+/, "").trim();
}

/** Convert designation hierarchy into a breadcrumb path */
function extractProductPath(designation: string | null): string | null {
  if (!designation) return null;
  const lines = designation.split("\n").filter((l) => l.trim());
  const parts = lines
    .map((line) =>
      line
        .replace(/^[-\s]+/, "")
        .replace(/:?\s*$/, "")
        .trim()
    )
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" > ") : null;
}

// Simple in-memory cache for AI translations (survives across requests in same process)
const translationCache = new Map<string, string>();

/** Translate a search query to French using Gemini AI */
async function translateWithAI(query: string): Promise<string | null> {
  const cacheKey = query.toLowerCase().trim();
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Translate this customs/trade search query to French. Return ONLY the French word(s), nothing else. No quotes, no explanation.\n\nQuery: "${query}"`
    );
    const translated = result.response.text().trim().replace(/^["']|["']$/g, "");
    if (translated && translated.toLowerCase() !== query.toLowerCase()) {
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (e) {
    console.error("AI translation error:", e);
  }
  return null;
}

/**
 * GET /api/tariff/search?q=lait&lang=fr
 * Search tariff codes by keyword or code number across all languages
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

  // Step 1: Try dictionary-based translation first (fast, no API call)
  let translatedQuery = reverseTranslateQuery(query, lang);

  // Step 2: If dictionary has no translation and query isn't French, try AI translation
  if (!translatedQuery && lang !== "fr") {
    translatedQuery = await translateWithAI(query);
  }

  // Step 3: Even for French queries with no FTS results, try AI to correct/expand
  // (handles cases like typos in non-French text or mixed-language queries)

  const { data, error } = await supabase.rpc("search_tariff_codes", {
    search_query: query,
    translated_query: translatedQuery || null,
    section_filter: sectionCode || null,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = data?.[0]?.total_count ?? 0;

  // If no results and we haven't tried AI yet (French query), try AI as last resort
  if (total === 0 && !translatedQuery && lang === "fr") {
    const aiTranslation = await translateWithAI(query);
    if (aiTranslation) {
      const { data: retryData, error: retryError } = await supabase.rpc("search_tariff_codes", {
        search_query: aiTranslation,
        translated_query: null,
        section_filter: sectionCode || null,
        result_limit: limit,
        result_offset: offset,
      });

      if (!retryError && retryData && retryData.length > 0) {
        const retryTotal = retryData[0]?.total_count ?? 0;
        const retryTotalPages = Math.ceil(Number(retryTotal) / limit);
        const retryResults = retryData.map((item: Record<string, unknown>) => {
          const desc = cleanDescription(item.description as string);
          const designation = item.designation as string | null;
          const productPath = extractProductPath(designation);
          return {
            full_code: item.full_code, section_code: item.section_code,
            chapitre_code: item.chapitre_code, description: desc,
            display_description: productPath || desc, designation,
            rangee_description: item.rangee_description as string | null,
            chapitre_description: item.chapitre_description as string | null,
            display_lang: "fr", dd: item.dd, prct: item.prct,
            tcs: item.tcs, tva: item.tva, dap: item.dap,
            usage_group: item.usage_group, unit: item.unit, rank: item.rank,
          };
        });
        return NextResponse.json({
          data: retryResults, query, lang,
          corrected_query: aiTranslation,
          pagination: {
            page, limit, total: Number(retryTotal), totalPages: retryTotalPages,
            hasNext: page < retryTotalPages, hasPrev: page > 1,
          },
        });
      }
    }
  }

  const totalPages = Math.ceil(Number(total) / limit);

  const results = (data || []).map((item: Record<string, unknown>) => {
    const desc = cleanDescription(item.description as string);
    const designation = item.designation as string | null;
    const productPath = extractProductPath(designation);
    return {
      full_code: item.full_code, section_code: item.section_code,
      chapitre_code: item.chapitre_code, description: desc,
      display_description: productPath || desc, designation,
      rangee_description: item.rangee_description as string | null,
      chapitre_description: item.chapitre_description as string | null,
      display_lang: "fr", dd: item.dd, prct: item.prct,
      tcs: item.tcs, tva: item.tva, dap: item.dap,
      usage_group: item.usage_group, unit: item.unit, rank: item.rank,
    };
  });

  return NextResponse.json({
    data: results, query, lang,
    pagination: {
      page, limit, total: Number(total), totalPages,
      hasNext: page < totalPages, hasPrev: page > 1,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reverseTranslateQuery } from "@/lib/tariff-translations";
import { getGeminiClient } from "@/lib/gemini";

/** Strip leading dash/space prefixes like "- - - Des types..." → "Des types..." */
function cleanDescription(text: string | null): string | null {
  if (!text) return text;
  return text.replace(/^[-\s]+/, "").trim();
}

/**
 * Drop diacritics (é → e, è → e, ç → c, …). The tariff data is stored unaccented,
 * so queries containing accents must be normalized before hitting the French FTS
 * — otherwise "débitmètres" stems to "débitmetr" which doesn't match the stored
 * "debitmetr" tokens.
 */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
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

// Function words we strip from user queries before strict-AND matching. Covers two
// classes:
//   - Words PostgreSQL's French FTS already treats as stopwords (de, la, avec, pour,
//     sur, par, dans, ou) — redundant here but harmless.
//   - Words FTS does NOT strip but that add noise to strict AND (tous, les, sans, ce,
//     cette, un, une, etc.) — these are the important ones.
const FRENCH_STOPWORDS = new Set([
  // Articles & determiners
  "de", "des", "du", "la", "le", "les", "l", "d", "un", "une",
  // Prepositions
  "en", "à", "au", "aux", "avec", "sans", "pour", "par", "sur", "sous", "dans",
  // Conjunctions
  "et", "ou", "mais", "donc",
  // Quantifiers & demonstratives
  "tous", "toute", "toutes", "tout", "ce", "cette", "ces", "cet",
]);

/**
 * Strip stopwords and return the meaningful query tokens (unique, lowercased).
 * Splits on whitespace *and* apostrophes so French contractions like "d'aspiration"
 * become ["d", "aspiration"] — "d" is stopword/too-short and gets dropped, leaving
 * "aspiration" in its correctly stemmable form. Stripping the apostrophe inline
 * (the old behavior) created junk tokens like "daspiration" → "daspir".
 */
function extractContentWords(q: string): string[] {
  return Array.from(
    new Set(
      q
        .trim()
        .toLowerCase()
        .split(/[\s'’]+/)
        .filter((w) => w.length >= 2 && !FRENCH_STOPWORDS.has(w))
    )
  );
}

/**
 * Drop the *leading* word, then any leading French stopwords.
 *
 * Rationale: in French (and most Romance languages) users type qualifier-first,
 * specific-noun-last — "kit de réparation de la pompe d'aspiration" narrows to
 * "pompe d'aspiration". Dropping from the tail would throw away the specific
 * noun and leave only the generic wrapper ("kit de réparation de la pompe"),
 * which then drags in unrelated fuzzy matches.
 *
 * Returns null when nothing meaningful remains.
 */
function shortenQuery(q: string): string | null {
  const words = q.trim().split(/\s+/);
  if (words.length <= 1) return null;
  words.shift();
  while (
    words.length > 0 &&
    FRENCH_STOPWORDS.has(words[0].toLowerCase().replace(/['’]/g, ""))
  ) {
    words.shift();
  }
  return words.length === 0 ? null : words.join(" ");
}

/** Shape a raw RPC row into the public API result object. */
function mapResult(item: Record<string, unknown>) {
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
}

// Positive cache: query -> French translation
const translationCache = new Map<string, string>();
// Negative cache: queries we've already confirmed have no useful translation
const negativeCache = new Set<string>();
// In-flight dedup so parallel identical queries share one API call
const inFlight = new Map<string, Promise<string | null>>();
// When Gemini returns 429, stop calling until this timestamp (ms since epoch)
let rateLimitedUntil = 0;

/** Translate a search query to French using Gemini AI */
async function translateWithAI(query: string): Promise<string | null> {
  const cacheKey = query.toLowerCase().trim();
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;
  if (negativeCache.has(cacheKey)) return null;
  if (Date.now() < rateLimitedUntil) return null;
  const existing = inFlight.get(cacheKey);
  if (existing) return existing;

  const promise = (async (): Promise<string | null> => {
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
      negativeCache.add(cacheKey);
      return null;
    } catch (e) {
      const err = e as { status?: number; statusCode?: number; message?: string };
      const status = err?.status ?? err?.statusCode;
      const is429 = status === 429 || /429|too many requests|quota/i.test(err?.message ?? "");
      if (is429) {
        rateLimitedUntil = Date.now() + 60_000;
        console.warn("Gemini rate-limited (429); backing off for 60s");
      } else {
        console.error("AI translation error:", e);
      }
      return null;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}

/**
 * GET /api/tariff/search?q=lait&lang=fr
 * Search tariff codes by keyword or code number across all languages
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawQuery = searchParams.get("q")?.trim();
  const sectionCode = searchParams.get("section");
  const lang = searchParams.get("lang") || "fr";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required (min 2 characters)" },
      { status: 400 }
    );
  }

  // Accent-normalize for matching — data is stored unaccented, so "débitmètres"
  // needs to be stripped to "debitmetres" before it reaches the French FTS.
  const query = stripAccents(rawQuery);

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

  // Fallback 1: content-only strict AND — strip filler words that French FTS doesn't
  // always treat as stopwords ("tous", "les", "sans", "ce", etc.) so the query lands
  // on just the meaningful terms. For "moteur avec tous les accessoires" the raw query
  // ANDs moteur & tous & le & accessoir (0 rows); content-only ANDs moteur & accessoir
  // which narrows to the 3 truly relevant rows.
  if (total === 0) {
    const contentWords = extractContentWords(query);
    const contentQuery = contentWords.join(" ");
    if (
      contentWords.length >= 2 &&
      contentQuery.toLowerCase() !== query.trim().toLowerCase()
    ) {
      const contentTranslated = reverseTranslateQuery(contentQuery, lang);
      const { data: retryData, error: retryErr } = await supabase.rpc("search_tariff_codes", {
        search_query: contentQuery,
        translated_query: contentTranslated || null,
        section_filter: sectionCode || null,
        result_limit: limit,
        result_offset: offset,
      });
      if (!retryErr && retryData && retryData.length > 0) {
        const retryTotal = retryData[0]?.total_count ?? 0;
        const retryTotalPages = Math.ceil(Number(retryTotal) / limit);
        return NextResponse.json({
          data: retryData.map(mapResult),
          query,
          used_query: contentQuery,
          fallback_reason: "content_only",
          lang,
          pagination: {
            page, limit, total: Number(retryTotal), totalPages: retryTotalPages,
            hasNext: page < retryTotalPages, hasPrev: page > 1,
          },
        });
      }
    }
  }

  // Fallback 2: progressive word-drop — when the full query returns nothing, peel trailing
  // words until a shorter prefix does. This keeps users from hitting a "no results" cliff
  // when they add a specific word (e.g. "unité de transfert de sable") that isn't in the
  // corpus, even though the shorter prefix ("unité de transfert") would match.
  if (total === 0 && query.split(/\s+/).length > 1) {
    let shortened: string | null = query;
    for (let i = 0; i < 3; i++) {
      shortened = shortenQuery(shortened!);
      if (!shortened) break;
      // Once we're down to a single word, hand off to the best-word fallback below.
      // A single word alone may match a less-salient term (e.g. "d'aspiration" → 5 rows)
      // while a different content word in the original query is far richer ("pompe" → 93).
      if (shortened.trim().split(/\s+/).length < 2) break;

      const shortenedTranslated = reverseTranslateQuery(shortened, lang);
      const { data: retryData, error: retryErr } = await supabase.rpc("search_tariff_codes", {
        search_query: shortened,
        translated_query: shortenedTranslated || null,
        section_filter: sectionCode || null,
        result_limit: limit,
        result_offset: offset,
      });
      if (retryErr) break;
      if (retryData && retryData.length > 0) {
        const retryTotal = retryData[0]?.total_count ?? 0;
        const retryTotalPages = Math.ceil(Number(retryTotal) / limit);
        return NextResponse.json({
          data: retryData.map(mapResult),
          query,
          used_query: shortened,
          fallback_reason: "word_drop",
          lang,
          pagination: {
            page, limit, total: Number(retryTotal), totalPages: retryTotalPages,
            hasNext: page < retryTotalPages, hasPrev: page > 1,
          },
        });
      }
    }
  }

  // Fallback 3: best content word — if no prefix matched, try each content word of the
  // original query individually and pick the one with the most hits. This rescues queries
  // where no row contains *all* the query words (e.g. "kit de réparation de la pompe
  // d'aspiration" — the DB has rows for "pompe" but none combining pompe + aspiration, so
  // strict AND at every prefix length returns 0). We surface the 93 "pompe" rows instead
  // of falling off a cliff.
  if (total === 0) {
    const contentWords = extractContentWords(query).slice(0, 6);

    if (contentWords.length >= 2) {
      // Parallel count probes (result_limit: 1 just to read total_count cheaply).
      const probes = await Promise.all(
        contentWords.map(async (w) => {
          const { data: probeData, error: probeErr } = await supabase.rpc("search_tariff_codes", {
            search_query: w,
            translated_query: null,
            section_filter: sectionCode || null,
            result_limit: 1,
            result_offset: 0,
          });
          if (probeErr) return { word: w, count: 0 };
          return { word: w, count: Number(probeData?.[0]?.total_count ?? 0) };
        })
      );
      const best = probes.reduce((a, b) => (b.count > a.count ? b : a), { word: "", count: 0 });
      if (best.count > 0) {
        const { data: bestData, error: bestErr } = await supabase.rpc("search_tariff_codes", {
          search_query: best.word,
          translated_query: reverseTranslateQuery(best.word, lang) || null,
          section_filter: sectionCode || null,
          result_limit: limit,
          result_offset: offset,
        });
        if (!bestErr && bestData && bestData.length > 0) {
          const bestTotal = bestData[0]?.total_count ?? 0;
          const bestTotalPages = Math.ceil(Number(bestTotal) / limit);
          return NextResponse.json({
            data: bestData.map(mapResult),
            query,
            used_query: best.word,
            fallback_reason: "best_word",
            lang,
            pagination: {
              page, limit, total: Number(bestTotal), totalPages: bestTotalPages,
              hasNext: page < bestTotalPages, hasPrev: page > 1,
            },
          });
        }
      }
    }
  }

  // Fallback 4: AI translation — only for French queries that still found nothing after
  // content-only, word-drop and best-word. Gemini costs a call (and is rate-limited),
  // so it runs last.
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
        return NextResponse.json({
          data: retryData.map(mapResult),
          query,
          used_query: aiTranslation,
          fallback_reason: "ai_translation",
          lang,
          pagination: {
            page, limit, total: Number(retryTotal), totalPages: retryTotalPages,
            hasNext: page < retryTotalPages, hasPrev: page > 1,
          },
        });
      }
    }
  }

  const totalPages = Math.ceil(Number(total) / limit);

  return NextResponse.json({
    data: (data || []).map(mapResult), query, lang,
    pagination: {
      page, limit, total: Number(total), totalPages,
      hasNext: page < totalPages, hasPrev: page > 1,
    },
  });
}

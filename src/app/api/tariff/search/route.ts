import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/tariff/search?q=lait
 * Search tariff codes by keyword or code number
 *
 * Query params:
 *   q       - search query (required)
 *   section - filter by section code
 *   page    - page number (default: 1)
 *   limit   - results per page (default: 50, max: 200)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const sectionCode = searchParams.get("section");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = (page - 1) * limit;

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required (min 2 characters)" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check if query looks like a code (digits only)
  const isCodeSearch = /^\d+$/.test(query);

  let dbQuery = supabase
    .from("tariff_codes")
    .select("*", { count: "exact" });

  if (isCodeSearch) {
    // Search by code prefix
    dbQuery = dbQuery.like("full_code", `${query}%`);
  } else {
    // Full-text search on description
    dbQuery = dbQuery.ilike("description", `%${query}%`);
  }

  if (sectionCode) {
    dbQuery = dbQuery.eq("section_code", sectionCode);
  }

  const { data, error, count } = await dbQuery
    .order("full_code")
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    query,
    pagination: { page, limit, total: count },
  });
}

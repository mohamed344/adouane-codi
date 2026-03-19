import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/tariff/sections
 * Returns all sections. Optionally expand chapitres with ?expand=chapitres
 *
 * GET /api/tariff/sections?section=01
 * Returns chapitres for a specific section
 *
 * GET /api/tariff/sections?section=01&chapitre=01
 * Returns tariff codes for a specific section+chapitre
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sectionCode = searchParams.get("section");
  const chapitreCode = searchParams.get("chapitre");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  // If section + chapitre: return tariff codes
  if (sectionCode && chapitreCode) {
    const { data, error, count } = await supabase
      .from("tariff_codes")
      .select("*", { count: "exact" })
      .eq("section_code", sectionCode)
      .eq("chapitre_code", chapitreCode)
      .order("full_code")
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: { page, limit, total: count },
    });
  }

  // If section only: return chapitres
  if (sectionCode) {
    const { data, error } = await supabase
      .from("tariff_chapitres")
      .select("*")
      .eq("section_code", sectionCode)
      .order("code");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  // Default: return all sections
  const { data, error } = await supabase
    .from("tariff_sections")
    .select("*")
    .order("code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

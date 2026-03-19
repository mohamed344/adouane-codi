import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/tariff/0101211100
 * Get a single tariff code with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code || code.length < 4) {
    return NextResponse.json(
      { error: "Invalid tariff code" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tariff_codes")
    .select("*")
    .eq("full_code", code)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Tariff code not found" },
      { status: 404 }
    );
  }

  // Also fetch section and chapitre info
  const [sectionResult, chapitreResult] = await Promise.all([
    supabase
      .from("tariff_sections")
      .select("*")
      .eq("code", data.section_code)
      .single(),
    supabase
      .from("tariff_chapitres")
      .select("*")
      .eq("section_code", data.section_code)
      .eq("code", data.chapitre_code)
      .single(),
  ]);

  return NextResponse.json({
    data: {
      ...data,
      section: sectionResult.data,
      chapitre: chapitreResult.data,
    },
  });
}

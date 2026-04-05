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

  // Single query with all related data via JOINs
  const { data, error } = await supabase.rpc("get_tariff_detail", {
    tariff_code: code,
  });

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      { error: "Tariff code not found" },
      { status: 404 }
    );
  }

  const row = data[0];
  return NextResponse.json({
    data: {
      id: row.id,
      full_code: row.full_code,
      section_code: row.section_code,
      chapitre_code: row.chapitre_code,
      range_code: row.range_code,
      position_code: row.position_code,
      description: row.description,
      dd: row.dd,
      prct: row.prct,
      tcs: row.tcs,
      tva: row.tva,
      dap: row.dap,
      other_taxes: row.other_taxes,
      usage_group: row.usage_group,
      unit: row.unit,
      tax_advantages: row.tax_advantages,
      designation: row.designation,
      cle: row.cle || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      section: row.section_code_val ? { code: row.section_code_val, description: row.section_desc } : null,
      chapitre: row.chapitre_code_val ? { code: row.chapitre_code_val, description: row.chapitre_desc } : null,
      rangee: row.rangee_code_val ? { code: row.rangee_code_val, description: row.rangee_desc } : null,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/slickpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, locale } = body as { planId: string; locale: string };

    if (!planId || !locale) {
      return NextResponse.json(
        { error: "Missing planId or locale" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch plan from DB
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.price === 0) {
      return NextResponse.json(
        { error: "Free plan does not require payment" },
        { status: 400 }
      );
    }

    // Get user details
    const { data: userData } = await supabase
      .from("users")
      .select("first_name, last_name, email, phone")
      .eq("id", user.id)
      .single();

    // Build return URL
    const origin = request.nextUrl.origin;
    const webhookUrl = `${origin}/api/subscription/webhook`;
    const webhookSecret = process.env.SLICKPAY_WEBHOOK_SECRET || "";

    const planLabel = `E-Douane - ${plan.name}`;

    const invoice = await createInvoice({
      amount: plan.price,
      items: [
        {
          name: planLabel,
          price: plan.price,
          quantity: 1,
        },
      ],
      url: `${origin}/${locale}/subscription/success?plan=${planId}`,
      firstname: userData?.first_name || "",
      lastname: userData?.last_name || "",
      email: userData?.email || user.email || "",
      phone: userData?.phone || "0000000000",
      address: "Algeria",
      webhook_url: webhookUrl,
      webhook_signature: webhookSecret,
      webhook_meta_data: [
        { user_id: user.id },
        { plan_id: planId },
        { billing_cycle: plan.billing_cycle },
      ],
      note: `Subscription: ${planLabel} - ${plan.price} DA`,
    });

    if (!invoice.success) {
      console.error("[SlickPay] Invoice creation failed:", JSON.stringify(invoice));
      return NextResponse.json(
        { error: invoice.message || "Failed to create invoice" },
        { status: 500 }
      );
    }

    const paymentUrl = invoice.url;

    console.log("[SlickPay] Invoice created:", { id: invoice.id, paymentUrl });

    if (!paymentUrl) {
      console.error("[SlickPay] No payment URL in response:", JSON.stringify(invoice));
      return NextResponse.json(
        { error: "Payment URL not available" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentUrl,
      invoiceId: invoice.id,
      planId: planId,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

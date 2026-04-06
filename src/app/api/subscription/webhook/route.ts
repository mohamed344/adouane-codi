import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/slickpay";

// Use service role client for webhook (no user session)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getExpirationDate(billingCycle: string): string {
  const date = new Date();
  if (billingCycle === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature if present
    const signature =
      body.webhook_signature ||
      request.headers.get("x-slickpay-signature") ||
      "";
    if (signature && !verifyWebhookSignature(signature)) {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const invoiceId = body.id || body.invoice_id;
    const completed = body.completed;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Missing invoice ID" },
        { status: 400 }
      );
    }

    // Extract metadata (flat object or legacy array format)
    const metadata = body.webhook_meta_data || body.meta_data || {};
    let userId = "";
    let planId = "";
    let billingCycle = "monthly";

    if (Array.isArray(metadata)) {
      for (const item of metadata) {
        if (item.user_id) userId = item.user_id;
        if (item.plan_id) planId = item.plan_id;
        if (item.billing_cycle) billingCycle = item.billing_cycle;
      }
    } else {
      userId = metadata.user_id || "";
      planId = metadata.plan_id || "";
      billingCycle = metadata.billing_cycle || "monthly";
    }

    if (completed === 1 && userId && planId) {
      const supabase = getServiceClient();

      // Check if subscription already exists (success page may have created it)
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("plan_id", planId)
        .eq("status", "active")
        .limit(1)
        .single();

      if (!existing) {
        // Create active subscription
        await supabase.from("subscriptions").insert({
          user_id: userId,
          plan_id: planId,
          status: "active",
          payment_id: `slickpay_${invoiceId}`,
          started_at: new Date().toISOString(),
          expires_at: getExpirationDate(billingCycle),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

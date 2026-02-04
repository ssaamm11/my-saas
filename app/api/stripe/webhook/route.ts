// TEMP BREAK TEST
// app/api/stripe/webhook/route.ts
// EXERCISE 4A — INTENTIONALLY INSECURE VERSION (break signature verification on purpose)

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

type StripeSubMinimal = {
  id: string;
  customer: string | { id: string };
  status: string;
  current_period_end?: number | null;
};

export async function POST(req: Request) {
  // IMPORTANT: For the break, we do NOT require stripe-signature and we do NOT constructEvent.
  // Anyone can POST JSON and it will be treated as a Stripe event.

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = JSON.parse(body) as Stripe.Event;
  } catch (err: any) {
    return NextResponse.json({ error: `Invalid JSON: ${err.message}` }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (!userId) break;

        const { error } = await supabase
          .from("profiles")
          .update({
            plan: "pro",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", userId);

        if (error) throw new Error(`Supabase update failed: ${error.message}`);

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as unknown as StripeSubMinimal;

        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        if (!customerId) break;

        const isActive =
          event.type !== "customer.subscription.deleted" &&
          ["active", "trialing"].includes(sub.status);

        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        const { error } = await supabase
          .from("profiles")
          .update({
            plan: isActive ? "pro" : "free",
            stripe_subscription_id: sub.id,
            current_period_end: currentPeriodEnd,
          })
          .eq("stripe_customer_id", customerId);

        if (error) throw new Error(`Supabase update failed: ${error.message}`);

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Webhook handler error" },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const user = data.user
  const priceId = process.env.STRIPE_PRICE_ID!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing/cancel`,
    client_reference_id: user.id, // critical link back to your Supabase user
    customer_email: user.email ?? undefined,
  })

  return NextResponse.json({ url: session.url })
}

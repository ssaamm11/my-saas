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

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  if (profileErr) {
    return NextResponse.json({ error: `Profile read failed: ${profileErr.message}` }, { status: 500 })
  }

  let customerId = profile?.stripe_customer_id ?? null
  let createdNewCustomer = false

  if (!customerId) {
    createdNewCustomer = true
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)

    if (updErr) {
      return NextResponse.json(
        { error: `Profile update failed: ${updErr.message}`, customerId },
        { status: 500 }
      )
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId!,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing/cancel`,
    client_reference_id: user.id,
  })

  return NextResponse.json({
    url: session.url,
    customerId,
    createdNewCustomer,
  })
}


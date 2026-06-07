import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-03-25.dahlia',
})

// On utilise le Admin Client car le webhook ne possède pas de session utilisateur
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) return NextResponse.json({ error: 'Webhook secret manquant' }, { status: 400 })
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Traitement de l'événement
  switch (event.type) {
    // Lors d'un paiement initial réussi
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const customerId = session.customer as string

      if (userId) {
        // Enregistrer le lien customer <-> supabase user
        await supabaseAdmin
          .from('stripe_customers')
          .upsert({ user_id: userId, stripe_customer_id: customerId })

        // Retrieve and save the subscription directly preventing race conditions
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const sub = subscription as any
          await supabaseAdmin.from('subscriptions').upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            plan_id: subscription.items.data[0].price.id,
            current_period_start: new Date((sub.current_period_start ?? sub.items?.data?.[0]?.current_period_start ?? 0) * 1000).toISOString(),
            current_period_end: new Date((sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? 0) * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
        }
      }
      break
    }

    // Création ou mise à jour d'un abonnement
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Trouver l'utilisateur lié à ce customer Stripe
      const { data: customerData } = await supabaseAdmin
        .from('stripe_customers')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (customerData) {
        const sub = subscription as any
        await supabaseAdmin.from('subscriptions').upsert({
          id: subscription.id,
          user_id: customerData.user_id,
          status: subscription.status,
          plan_id: subscription.items.data[0].price.id,
          current_period_start: new Date((sub.current_period_start ?? sub.items?.data?.[0]?.current_period_start ?? 0) * 1000).toISOString(),
          current_period_end: new Date((sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? 0) * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
      }
      break
    }

    // Suppression d'un abonnement
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled', cancel_at_period_end: false, updated_at: new Date().toISOString() })
        .eq('id', subscription.id)
      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Configuration de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20', // ou plus récent selon votre compte
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { interval, planId } = body // 'month' ou 'year', 'starter' ou 'pro'
    
    let priceId: string | undefined

    if (planId === 'pro') {
      priceId = interval === 'year' 
        ? process.env.STRIPE_ANNUAL_PRO_PRICE_ID 
        : process.env.STRIPE_MONTHLY_PRO_PRICE_ID
    } else if (planId === 'starter') {
      priceId = interval === 'year' 
        ? process.env.STRIPE_ANNUAL_STARTER_PRICE_ID 
        : process.env.STRIPE_MONTHLY_STARTER_PRICE_ID
    }

    if (!priceId) {
      console.error(`Le prix Stripe n'est pas configuré pour le plan ${planId} (${interval}).`)
      return NextResponse.json({ error: `Le plan ${planId.toUpperCase()} n'a pas encore été configuré dans Stripe.` }, { status: 400 })
    }

    // Récupérer le client Stripe existant s'il existe
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    const stripeCustomerId = customerData?.stripe_customer_id

    // Création de la session Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId || undefined,
      customer_email: stripeCustomerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard/billing?success=true`,
      cancel_url: `${request.headers.get('origin')}/dashboard/billing?canceled=true`,
      // Le client_reference_id est CRUCIAL, il nous permettra d'identifier
      // l'utilisateur dans le Webhook quand il paiera.
      client_reference_id: user.id,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur Serveur Interne', details: error.message }, { status: 500 })
  }
}

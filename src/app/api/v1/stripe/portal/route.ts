import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Configuration de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer le client Stripe existant via la base de l'utilisateur
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!customerData || !customerData.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucune facturation trouvée pour ce compte' }, { status: 400 })
    }

    // Génération du lien de portail client
    const returnUrl = `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error: any) {
    console.error('Portal session error:', error)
    return NextResponse.json({ error: 'Erreur Serveur Interne', details: error.message }, { status: 500 })
  }
}

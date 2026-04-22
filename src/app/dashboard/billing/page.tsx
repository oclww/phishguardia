import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Rechercher l'abonnement actif du client
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  let activePlanId: string | null = null
  let isYearly = false

  if (subscription) {
    const pId = subscription.plan_id
    if (pId === process.env.STRIPE_MONTHLY_PRO_PRICE_ID) activePlanId = 'pro'
    else if (pId === process.env.STRIPE_ANNUAL_PRO_PRICE_ID) { activePlanId = 'pro'; isYearly = true }
    else if (pId === process.env.STRIPE_MONTHLY_STARTER_PRICE_ID) activePlanId = 'starter'
    else if (pId === process.env.STRIPE_ANNUAL_STARTER_PRICE_ID) { activePlanId = 'starter'; isYearly = true }
  }

  return <BillingClient 
            initialSubscription={subscription} 
            activePlanId={activePlanId} 
            isYearly={isYearly} 
         />
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://llgoqyyhmfycyoodpcze.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('subscriptions').select('*')
  console.log('Subscriptions:', data)
  console.error('Error:', error)
}
check()

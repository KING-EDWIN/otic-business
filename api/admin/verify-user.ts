import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const adminSecret = req.headers['x-admin-secret'] as string
  const expectedSecret = process.env.ADMIN_API_SECRET

  if (!expectedSecret || adminSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { userId, verified } = req.body || {}
  if (!userId || typeof verified !== 'boolean') {
    return res.status(400).json({ error: 'userId and verified are required' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server not configured (Supabase env missing)' })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    // Update profile flags
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        email_verified: verified,
        verification_timestamp: verified ? new Date().toISOString() : null,
        verified_by: verified ? 'admin_manual' : null,
      })
      .eq('id', userId)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    // Best-effort: Mark confirmed in auth if verifying
    if (verified) {
      try {
        // @ts-ignore - admin API available with service role
        await (supabase as any).auth.admin.updateUserById(userId, { email_confirm: true })
      } catch (e) {
        // non-fatal
      }
    }

    return res.status(200).json({ success: true })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unknown error' })
  }
}



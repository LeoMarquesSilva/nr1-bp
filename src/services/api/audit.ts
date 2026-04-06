import { getSupabase } from '@/lib/supabase'

export async function logAdminAuditAction(input: {
  action: string
  tenantId?: string
  details?: Record<string, string | number | boolean | null>
}): Promise<void> {
  try {
    const supabase = getSupabase()
    const { data: sessionData } = await supabase.auth.getSession()
    const actorId = sessionData.session?.user.id
    if (!actorId) return

    await supabase.from('admin_audit_log').insert({
      actor_auth_id: actorId,
      tenant_id: input.tenantId ?? null,
      action: input.action,
      details: input.details ?? {},
    })
  } catch {
    // non-blocking best effort
  }
}


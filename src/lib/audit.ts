import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'node:crypto'

/**
 * Fire-and-forget security audit logging. Writes to the `audit_logs` table
 * via the service role (RLS-protected, admin-only readable). Never throws —
 * a logging failure must never break the action being logged.
 *
 * Store only a truncated sha256 of the IP, never the raw address.
 */
export interface AuditEntry {
  action: string                       // 'auth.login', 'trade.approve', 'media.delete', …
  actorId?: string | null
  actorEmail?: string | null
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown>
  request?: Request                    // used to derive a hashed IP
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    let ipHash: string | null = null
    const ip = entry.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (ip) ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

    await createAdminClient().from('audit_logs').insert({
      action:      entry.action,
      actor_id:    entry.actorId ?? null,
      actor_email: entry.actorEmail ?? null,
      entity_type: entry.entityType ?? null,
      entity_id:   entry.entityId ?? null,
      metadata:    entry.metadata ?? {},
      ip_hash:     ipHash,
    })
  } catch (err) {
    console.error('[audit] failed to record entry:', entry.action, err)
  }
}

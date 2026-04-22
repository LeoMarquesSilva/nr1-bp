import { getSupabase } from '@/lib/supabase'

const BUCKET = 'tenant-logos'

/** Normaliza URL de logo; string vazia vira null. */
export function normalizeTenantLogoUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  let u: URL
  try {
    u = new URL(t)
  } catch {
    throw new Error('URL da imagem inválida. Use um endereço http(s) completo.')
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error('A URL da logo deve começar com http:// ou https://')
  }
  return t
}

const MAX_BYTES = 2 * 1024 * 1024

/** Envia imagem ao bucket público `tenant-logos` e retorna a URL pública. */
export async function uploadTenantLogoFile(tenantSlug: string, file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error('Imagem muito grande. Tamanho máximo: 2 MB.')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Envie apenas um arquivo de imagem.')
  }
  const supabase = getSupabase()
  const rawExt = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
  const ext = ['png', 'jpeg', 'jpg', 'webp', 'gif', 'svg'].includes(rawExt)
    ? rawExt === 'jpg'
      ? 'jpeg'
      : rawExt
    : 'png'
  const path = `${tenantSlug.trim().toLowerCase()}/logo-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  })
  if (error) {
    console.error('uploadTenantLogoFile:', error)
    const msg = (error as { message?: string }).message ?? ''
    if (/bucket not found/i.test(msg)) {
      throw new Error(
        'O bucket de armazenamento "tenant-logos" ainda não existe neste projeto Supabase. ' +
          'No painel: SQL Editor → execute o ficheiro supabase/migrations/024_tenant_logo.sql (ou faça deploy das migrações). ' +
          'Sem isso o upload da logo não funciona.'
      )
    }
    if (/row-level security|rls|permission denied|not authorized/i.test(msg)) {
      throw new Error(
        'Sem permissão para gravar no bucket de logos. Confirme que as políticas RLS do ficheiro 024_tenant_logo.sql foram aplicadas e que o utilizador é admin (is_admin()).'
      )
    }
    throw new Error(msg || 'Não foi possível enviar a imagem.')
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

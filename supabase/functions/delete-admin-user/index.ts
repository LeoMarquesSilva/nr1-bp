import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new HttpError(500, 'Variáveis de ambiente do Supabase não configuradas.')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new HttpError(401, 'Cabeçalho Authorization não encontrado.')
    }

    const supabaseAuthClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Pegar o token JWT diretamente em vez de getUser()
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token)
    if (authError || !user) {
      throw new HttpError(401, `Usuário não autenticado: ${authError?.message || 'Nenhum usuário encontrado'}`)
    }

    // Verificar se quem chama a função é um admin ativo
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('users')
      .select('role, is_active')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (callerError || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.is_active) {
      throw new HttpError(403, 'Acesso negado: Apenas administradores ativos podem excluir usuários.')
    }

    // Extrair os dados da requisição
    const body = await req.json().catch(() => null)
    const { userId } = body ?? {}
    if (!userId) {
      throw new HttpError(400, 'Campo obrigatório: userId.')
    }

    if (userId === user.id) {
      throw new HttpError(400, 'Você não pode excluir a si mesmo.')
    }

    // Deletar o usuário no Supabase Auth
    // Isso também excluirá da tabela public.users devido à configuração ON DELETE CASCADE
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    return jsonResponse({ success: true }, 200)
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return jsonResponse({ error: message }, status)
  }
})

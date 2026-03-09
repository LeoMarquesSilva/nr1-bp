import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas.')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Cabeçalho Authorization não encontrado.')
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
      throw new Error(`Usuário não autenticado: ${authError?.message || 'Nenhum usuário encontrado'}`)
    }

    // Verificar se quem chama a função é um admin ativo
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('users')
      .select('role, is_active')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (callerError || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.is_active) {
      throw new Error('Acesso negado: Apenas administradores ativos podem excluir usuários.')
    }

    // Extrair os dados da requisição
    const { userId } = await req.json()
    if (!userId) {
      throw new Error('Campo obrigatório: userId.')
    }

    if (userId === user.id) {
      throw new Error('Você não pode excluir a si mesmo.')
    }

    // Deletar o usuário no Supabase Auth
    // Isso também excluirá da tabela public.users devido à configuração ON DELETE CASCADE
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})

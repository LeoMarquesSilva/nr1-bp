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
      throw new Error('Acesso negado: Apenas administradores ativos podem criar usuários.')
    }

    // Extrair os dados da requisição
    const { name, email, password, department } = await req.json()
    if (!name || !email || !password) {
      throw new Error('Campos obrigatórios: name, email, password.')
    }

    // 1. Criar o usuário no Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (createError) {
      throw createError
    }

    if (!newUser?.user?.id) {
      throw new Error('Erro ao obter ID do novo usuário criado.')
    }

    // 2. Inserir o perfil na tabela public.users
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      auth_id: newUser.user.id,
      name,
      email,
      department: department || null,
      role: 'admin',
      is_active: true,
      requires_password_change: true
    })

    if (insertError) {
      // Rollback: se falhar a inserção na tabela, tentar apagar do Auth
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true, user: { id: newUser.user.id, email } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})

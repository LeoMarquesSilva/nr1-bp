-- Garantir que o role authenticated possa inserir/atualizar/excluir em tenant_registry
-- quando as políticas RLS (is_admin()) permitirem. Sem esses grants, retorna 403.
GRANT INSERT, UPDATE, DELETE ON public.tenant_registry TO authenticated;

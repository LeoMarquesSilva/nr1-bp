-- Protocolo e status para canal de denúncias (ISO 37002 / NR-01 / Lei 14.457)
-- Cada denúncia tem um protocol_id único para acompanhamento anônimo pelo denunciante.

-- 1) Colunas protocol_id e status
ALTER TABLE public.whistleblower_reports
  ADD COLUMN IF NOT EXISTS protocol_id text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'recebida';

-- 2) Backfill protocol_id para registros existentes (único por id)
UPDATE public.whistleblower_reports
SET protocol_id = 'WB-' || upper(substr(replace(id::text, '-', ''), 1, 12))
WHERE protocol_id IS NULL;

-- 3) Restringir a único e não nulo (novos registros sempre terão protocol_id da aplicação)
ALTER TABLE public.whistleblower_reports
  DROP CONSTRAINT IF EXISTS whistleblower_reports_protocol_id_key;
ALTER TABLE public.whistleblower_reports
  ADD CONSTRAINT whistleblower_reports_protocol_id_key UNIQUE (protocol_id);
-- Manter protocol_id nullable para compatibilidade com backfill; a aplicação sempre envia valor.

-- 4) Índice para consulta pública por protocol_id
CREATE INDEX IF NOT EXISTS whistleblower_reports_protocol_id_idx
  ON public.whistleblower_reports (protocol_id);

-- 5) RPC para consulta anônima: retorna apenas status dado o protocol_id (sem expor corpo da denúncia)
CREATE OR REPLACE FUNCTION public.get_whistleblower_status(p_protocol_id text)
RETURNS table(status text, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.status, w.created_at
  FROM public.whistleblower_reports w
  WHERE w.protocol_id = p_protocol_id;
$$;

-- Permite anon chamar a RPC
GRANT EXECUTE ON FUNCTION public.get_whistleblower_status(text) TO anon;

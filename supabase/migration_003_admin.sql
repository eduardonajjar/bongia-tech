-- BongiaTech — Migration 003: funções para o painel admin
-- Execute no SQL Editor do Supabase

-- Novos lojistas por dia nos últimos 30 dias
CREATE OR REPLACE FUNCTION admin_novos_por_dia()
RETURNS TABLE(dia DATE, total BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    DATE(criado_em) AS dia,
    COUNT(*) AS total
  FROM lojistas
  WHERE criado_em >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(criado_em)
  ORDER BY dia ASC;
$$;

-- Coluna aprovado_em e aprovado_por no pagamentos (se não existir)
ALTER TABLE pagamentos
  ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS aprovado_por UUID;

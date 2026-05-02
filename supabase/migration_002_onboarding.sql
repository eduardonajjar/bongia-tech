-- BongiaTech — Migration 002: onboarding e pagamento_automatico_ativo
-- Execute no SQL Editor do Supabase

ALTER TABLE lojistas
  ADD COLUMN IF NOT EXISTS pagamento_automatico_ativo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_concluido BOOLEAN DEFAULT false;

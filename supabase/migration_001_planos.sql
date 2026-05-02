-- BongiaTech — Migration 001: campo pagamento_automatico_ativo
-- Execute no SQL Editor do Supabase

ALTER TABLE lojistas
  ADD COLUMN IF NOT EXISTS pagamento_automatico_ativo BOOLEAN DEFAULT false;

-- Só fica true quando plano=pro E asaas_api_key configurada
-- Atualizado via API quando lojista conecta Asaas com plano Pro

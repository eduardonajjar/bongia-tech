-- Altera o default do trial de 14 para 30 dias
-- Execute no SQL Editor do Supabase

ALTER TABLE lojistas
  ALTER COLUMN trial_ate SET DEFAULT (now() + INTERVAL '30 days');

-- Opcional: estende trial de contas existentes no starter que ainda não expiraram
-- (descomente se quiser dar 30 dias para quem já estava em trial)
-- UPDATE lojistas
--   SET trial_ate = criado_em + INTERVAL '30 days'
-- WHERE trial_ate > now()
--   AND plano = 'starter';

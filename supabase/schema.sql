-- ============================================================
-- BongiaTech — Schema Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Lojistas (sincronizado com auth.users)
CREATE TABLE lojistas (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                    TEXT NOT NULL,
  email                   TEXT UNIQUE NOT NULL,
  plano                   TEXT DEFAULT 'starter' CHECK (plano IN ('starter', 'pro')),
  comissao_padrao         DECIMAL DEFAULT 10.0 CHECK (comissao_padrao >= 0 AND comissao_padrao <= 100),
  janela_atribuicao_dias  INTEGER DEFAULT 30 CHECK (janela_atribuicao_dias > 0),
  nuvemshop_token         TEXT,
  nuvemshop_store_id      TEXT,
  asaas_api_key           TEXT, -- armazenado criptografado (AES-256)
  ativo                   BOOLEAN DEFAULT true,
  trial_ate               TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  criado_em               TIMESTAMPTZ DEFAULT now()
);

-- Afiliados
CREATE TABLE afiliados (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id      UUID NOT NULL REFERENCES lojistas(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL,
  chave_pix       TEXT,
  tipo_pix        TEXT CHECK (tipo_pix IN ('cpf', 'email', 'telefone', 'chave_aleatoria')),
  token           TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  ref_code        TEXT UNIQUE NOT NULL,
  comissao        DECIMAL CHECK (comissao IS NULL OR (comissao >= 0 AND comissao <= 100)),
  saldo           DECIMAL DEFAULT 0 CHECK (saldo >= 0),
  total_vendas    DECIMAL DEFAULT 0,
  total_cliques   INTEGER DEFAULT 0,
  ativo           BOOLEAN DEFAULT true,
  criado_em       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lojista_id, email)
);

-- Cliques rastreados
CREATE TABLE cliques (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id     UUID NOT NULL REFERENCES afiliados(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  ip              TEXT,
  user_agent      TEXT,
  url_origem      TEXT,
  criado_em       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cliques_session ON cliques(session_id);
CREATE INDEX idx_cliques_afiliado ON cliques(afiliado_id);
CREATE INDEX idx_cliques_criado ON cliques(criado_em);

-- Vendas atribuídas
CREATE TABLE vendas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id      UUID NOT NULL REFERENCES lojistas(id) ON DELETE CASCADE,
  afiliado_id     UUID REFERENCES afiliados(id) ON DELETE SET NULL,
  pedido_id       TEXT NOT NULL,
  valor_pedido    DECIMAL NOT NULL CHECK (valor_pedido > 0),
  valor_comissao  DECIMAL NOT NULL CHECK (valor_comissao >= 0),
  status          TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'pago', 'cancelado')),
  session_id      TEXT,
  criado_em       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lojista_id, pedido_id)
);

CREATE INDEX idx_vendas_lojista ON vendas(lojista_id);
CREATE INDEX idx_vendas_afiliado ON vendas(afiliado_id);
CREATE INDEX idx_vendas_status ON vendas(status);

-- Pagamentos em lote
CREATE TABLE pagamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id      UUID NOT NULL REFERENCES lojistas(id) ON DELETE CASCADE,
  total_pago      DECIMAL NOT NULL,
  taxa_plataforma DECIMAL NOT NULL,
  afiliados_pagos INTEGER NOT NULL,
  asaas_batch_id  TEXT,
  status          TEXT DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro')),
  criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Pagamentos individuais por afiliado
CREATE TABLE pagamentos_afiliados (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pagamento_id      UUID NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
  afiliado_id       UUID REFERENCES afiliados(id) ON DELETE SET NULL,
  valor             DECIMAL NOT NULL,
  chave_pix         TEXT NOT NULL,
  asaas_transfer_id TEXT,
  status            TEXT DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro')),
  criado_em         TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE lojistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliques ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_afiliados ENABLE ROW LEVEL SECURITY;

-- Lojistas: só lê/edita seus próprios dados
CREATE POLICY "lojista_select" ON lojistas FOR SELECT USING (auth.uid() = id);
CREATE POLICY "lojista_update" ON lojistas FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "lojista_insert" ON lojistas FOR INSERT WITH CHECK (auth.uid() = id);

-- Afiliados: lojista gerencia seus próprios
CREATE POLICY "afiliados_lojista" ON afiliados FOR ALL USING (
  lojista_id = auth.uid()
);

-- Cliques: insert público (via API route), select por lojista
CREATE POLICY "cliques_insert" ON cliques FOR INSERT WITH CHECK (true);
CREATE POLICY "cliques_select" ON cliques FOR SELECT USING (
  afiliado_id IN (SELECT id FROM afiliados WHERE lojista_id = auth.uid())
);

-- Vendas: lojista vê suas vendas
CREATE POLICY "vendas_lojista" ON vendas FOR ALL USING (lojista_id = auth.uid());

-- Pagamentos: lojista vê seus pagamentos
CREATE POLICY "pagamentos_lojista" ON pagamentos FOR ALL USING (lojista_id = auth.uid());
CREATE POLICY "pagamentos_afiliados_lojista" ON pagamentos_afiliados FOR ALL USING (
  pagamento_id IN (SELECT id FROM pagamentos WHERE lojista_id = auth.uid())
);

-- ============================================================
-- Funções auxiliares
-- ============================================================

-- Incrementa saldo do afiliado atomicamente
CREATE OR REPLACE FUNCTION incrementar_saldo_afiliado(
  p_afiliado_id UUID,
  p_valor DECIMAL,
  p_valor_venda DECIMAL
) RETURNS void AS $$
BEGIN
  UPDATE afiliados
  SET
    saldo = saldo + p_valor,
    total_vendas = total_vendas + p_valor_venda
  WHERE id = p_afiliado_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: criar registro de lojista após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO lojistas (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

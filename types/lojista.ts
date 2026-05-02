export interface Lojista {
  id: string
  nome: string
  email: string
  plano: 'starter' | 'pro'
  comissao_padrao: number
  janela_atribuicao_dias: number
  nuvemshop_token: string | null
  nuvemshop_store_id: string | null
  asaas_api_key: string | null
  ativo: boolean
  trial_ate: string
  criado_em: string
}

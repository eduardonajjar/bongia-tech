export interface Afiliado {
  id: string
  lojista_id: string
  nome: string
  email: string
  chave_pix: string | null
  tipo_pix: 'cpf' | 'email' | 'telefone' | 'chave_aleatoria' | null
  token: string
  ref_code: string
  comissao: number | null
  saldo: number
  total_vendas: number
  total_cliques: number
  ativo: boolean
  criado_em: string
}

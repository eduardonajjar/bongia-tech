export interface Venda {
  id: string
  lojista_id: string
  afiliado_id: string
  pedido_id: string
  valor_pedido: number
  valor_comissao: number
  status: 'pendente' | 'confirmado' | 'pago' | 'cancelado'
  session_id: string | null
  criado_em: string
  afiliados?: { nome: string; email: string }
}

export interface Pagamento {
  id: string
  lojista_id: string
  total_pago: number
  taxa_plataforma: number
  afiliados_pagos: number
  asaas_batch_id: string | null
  status: 'processando' | 'concluido' | 'erro'
  criado_em: string
}

export interface PagamentoAfiliado {
  id: string
  pagamento_id: string
  afiliado_id: string
  valor: number
  chave_pix: string
  asaas_transfer_id: string | null
  status: 'processando' | 'concluido' | 'erro'
  criado_em: string
}

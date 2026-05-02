export const PLANOS = {
  starter: {
    nome: 'Starter',
    preco: 149,
    limite_afiliados: 50,
    pagamento_automatico: false,
    descricao: 'Rastreamento completo, dashboard e painel do afiliado. Você paga os afiliados manualmente sabendo exatamente quanto deve a cada um.',
    features: [
      'Até 50 afiliados ativos',
      'Rastreamento ilimitado por link',
      'Dashboard do lojista completo',
      'Painel do afiliado em tempo real',
      'Histórico de vendas',
      'Exportar CSV para pagar manualmente',
    ],
  },
  pro: {
    nome: 'Pro',
    preco: 349,
    limite_afiliados: null, // ilimitado
    pagamento_automatico: true,
    descricao: 'Tudo do Starter + pagamento automático via PIX com 1 clique para todos os afiliados simultaneamente.',
    features: [
      'Afiliados ilimitados',
      'Tudo do plano Starter',
      'Pagamento automático via PIX (1 clique)',
      'Relatórios avançados',
      'Integração Asaas obrigatória',
      '+ 3% sobre comissões pagas via PIX',
    ],
  },
} as const

export type Plano = keyof typeof PLANOS

export function podePagarAutomatico(lojista: {
  plano: string
  pagamento_automatico_ativo: boolean
  asaas_api_key: string | null
}): boolean {
  return lojista.plano === 'pro' &&
    lojista.pagamento_automatico_ativo === true &&
    !!lojista.asaas_api_key
}

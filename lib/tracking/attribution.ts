import { createServiceClient } from '@/lib/supabase/server'

export interface ProdutoVenda {
  nome: string
  quantidade: number
  preco_unitario: number
  total: number
}

export async function atribuirVenda(dados: {
  lojistaId: string
  pedidoId: string
  valorProdutos: number   // valor só dos produtos (sem frete)
  sessionId: string | null
  comissaoPadrao: number
  numeroPedido?: string
  produtos?: ProdutoVenda[]
}) {
  if (!dados.sessionId) {
    console.log('[attribution] sem sessionId — venda não atribuída')
    return null
  }

  const supabase = await createServiceClient()

  // Busca o clique mais recente dentro da janela de atribuição do lojista
  const { data: lojista } = await supabase
    .from('lojistas')
    .select('janela_atribuicao_dias')
    .eq('id', dados.lojistaId)
    .single()

  const janelaDias = lojista?.janela_atribuicao_dias ?? 30
  const janela = new Date()
  janela.setDate(janela.getDate() - janelaDias)

  const { data: clique } = await supabase
    .from('cliques')
    .select('afiliado_id, afiliados(comissao, lojista_id)')
    .eq('session_id', dados.sessionId)
    .gte('criado_em', janela.toISOString())
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  if (!clique) {
    console.log('[attribution] clique não encontrado para session:', dados.sessionId)
    return null
  }

  const afiliado = clique.afiliados as unknown as { comissao: number | null; lojista_id: string } | null
  if (!afiliado || afiliado.lojista_id !== dados.lojistaId) {
    console.log('[attribution] afiliado não pertence a este lojista')
    return null
  }

  // Verifica se este pedido já foi atribuído (idempotência)
  const { data: vendaExistente } = await supabase
    .from('vendas')
    .select('id')
    .eq('pedido_id', dados.pedidoId)
    .eq('lojista_id', dados.lojistaId)
    .maybeSingle()

  if (vendaExistente) {
    console.log('[attribution] pedido já atribuído:', dados.pedidoId)
    return null
  }

  // Comissão sobre o valor dos PRODUTOS (não inclui frete)
  const taxaComissao = afiliado.comissao ?? dados.comissaoPadrao
  const valorComissao = parseFloat(((dados.valorProdutos * taxaComissao) / 100).toFixed(2))

  const { data: venda, error } = await supabase
    .from('vendas')
    .insert({
      lojista_id: dados.lojistaId,
      afiliado_id: clique.afiliado_id,
      pedido_id: dados.pedidoId,
      valor_pedido: dados.valorProdutos,
      valor_comissao: valorComissao,
      status: 'confirmado',
      session_id: dados.sessionId,
      numero_pedido: dados.numeroPedido ?? null,
      produtos: dados.produtos ?? null,
    })
    .select()
    .single()

  if (error || !venda) {
    console.error('[attribution] erro ao inserir venda:', error)
    return null
  }

  // Incrementa saldo e total_vendas do afiliado
  await supabase.rpc('incrementar_saldo_afiliado', {
    p_afiliado_id: clique.afiliado_id,
    p_valor: valorComissao,
    p_valor_venda: dados.valorProdutos,
  })

  console.log('[attribution] venda atribuída:', dados.pedidoId, 'comissão:', valorComissao)
  return venda
}

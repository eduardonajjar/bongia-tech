import { createServiceClient } from '@/lib/supabase/server'
import { COOKIE_SESSION } from './cookie'

export async function atribuirVenda(dados: {
  lojistaId: string
  pedidoId: string
  valorPedido: number
  cookieHeader: string | null
  comissaoPadrao: number
}) {
  if (!dados.cookieHeader) return null

  const cookies = Object.fromEntries(
    dados.cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k.trim(), v.join('=').trim()]
    })
  )

  const sessionId = cookies[COOKIE_SESSION]
  if (!sessionId) return null

  const supabase = await createServiceClient()

  const { data: clique } = await supabase
    .from('cliques')
    .select('afiliado_id, afiliados(comissao, lojista_id)')
    .eq('session_id', sessionId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  if (!clique) return null

  const afiliado = (clique.afiliados as unknown) as { comissao: number | null; lojista_id: string } | null
  if (!afiliado || afiliado.lojista_id !== dados.lojistaId) return null

  const taxaComissao = afiliado.comissao ?? dados.comissaoPadrao
  const valorComissao = (dados.valorPedido * taxaComissao) / 100

  const { data: venda, error } = await supabase
    .from('vendas')
    .insert({
      lojista_id: dados.lojistaId,
      afiliado_id: clique.afiliado_id,
      pedido_id: dados.pedidoId,
      valor_pedido: dados.valorPedido,
      valor_comissao: valorComissao,
      status: 'confirmado',
      session_id: sessionId,
    })
    .select()
    .single()

  if (error || !venda) return null

  await supabase.rpc('incrementar_saldo_afiliado', {
    p_afiliado_id: clique.afiliado_id,
    p_valor: valorComissao,
    p_valor_venda: dados.valorPedido,
  })

  return venda
}

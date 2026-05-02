import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { pagarAfiliados } from '@/lib/integrations/asaas'
import { enviarConfirmacaoPix } from '@/lib/integrations/resend'
import { decrypt } from '@/lib/utils'
import { podePagarAutomatico } from '@/lib/planos'

const TAXA_PLATAFORMA = 0.03

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { afiliado_ids } = body as { afiliado_ids?: string[] }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('asaas_api_key, nome, plano, pagamento_automatico_ativo')
    .eq('id', user.id)
    .single()

  if (!lojista || !podePagarAutomatico(lojista as { plano: string; pagamento_automatico_ativo: boolean; asaas_api_key: string | null })) {
    return NextResponse.json(
      { erro: 'Pagamento automático disponível apenas no plano Pro com Asaas configurado.' },
      { status: 403 }
    )
  }

  const asaasKey = decrypt(lojista.asaas_api_key!)

  // Buscar afiliados — se afiliado_ids fornecido, filtra; senão pega todos com saldo
  let query = supabase
    .from('afiliados')
    .select('id, nome, email, token, chave_pix, saldo')
    .eq('lojista_id', user.id)
    .eq('ativo', true)
    .gt('saldo', 0)
    .not('chave_pix', 'is', null)

  if (afiliado_ids && afiliado_ids.length > 0) {
    query = query.in('id', afiliado_ids)
  }

  const { data: afiliados } = await query

  if (!afiliados || afiliados.length === 0) {
    return NextResponse.json({ erro: 'Nenhum afiliado com saldo e chave PIX para pagar.' }, { status: 400 })
  }

  const totalComissoes = afiliados.reduce((sum, a) => sum + a.saldo, 0)
  const taxaPlataforma = totalComissoes * TAXA_PLATAFORMA
  const agora = new Date().toISOString()

  const serviceClient = await createServiceClient()

  const { data: pagamento } = await serviceClient
    .from('pagamentos')
    .insert({
      lojista_id: user.id,
      total_pago: totalComissoes,
      taxa_plataforma: taxaPlataforma,
      afiliados_pagos: afiliados.length,
      status: 'processando',
      aprovado_em: agora,
      aprovado_por: user.id,
    })
    .select()
    .single()

  if (!pagamento) {
    return NextResponse.json({ erro: 'Erro ao registrar pagamento' }, { status: 500 })
  }

  const resultados = await pagarAfiliados(
    asaasKey,
    afiliados.map((a) => ({ chavePix: a.chave_pix!, valor: a.saldo, nome: a.nome }))
  )

  const pagamentosAfiliados = afiliados.map((a, i) => ({
    pagamento_id: pagamento.id,
    afiliado_id: a.id,
    valor: a.saldo,
    chave_pix: a.chave_pix!,
    asaas_transfer_id: resultados[i]?.transferId || null,
    status: resultados[i]?.sucesso ? 'concluido' : 'erro',
  }))

  await serviceClient.from('pagamentos_afiliados').insert(pagamentosAfiliados)

  const sucedidos = resultados.filter((r) => r.sucesso)

  for (const afiliado of afiliados) {
    const resultado = resultados.find((r) => r.chavePix === afiliado.chave_pix)
    if (resultado?.sucesso) {
      await serviceClient.from('afiliados').update({ saldo: 0 }).eq('id', afiliado.id)
      await serviceClient
        .from('vendas')
        .update({ status: 'pago' })
        .eq('afiliado_id', afiliado.id)
        .eq('lojista_id', user.id)
        .eq('status', 'confirmado')

      await enviarConfirmacaoPix({
        nome: afiliado.nome,
        email: afiliado.email,
        valor: afiliado.saldo,
        token: afiliado.token,
      }).catch(() => {})
    }
  }

  const statusFinal = sucedidos.length === afiliados.length ? 'concluido' : 'erro'
  await serviceClient.from('pagamentos').update({ status: statusFinal }).eq('id', pagamento.id)

  return NextResponse.json({
    ok: true,
    pagamento_id: pagamento.id,
    total_pago: totalComissoes,
    taxa_plataforma: taxaPlataforma,
    afiliados_pagos: sucedidos.length,
    afiliados_erro: afiliados.length - sucedidos.length,
  })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('lojista_id', user.id)
    .order('criado_em', { ascending: false })

  return NextResponse.json(data || [])
}

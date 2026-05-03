import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
  }

  const service = await createServiceClient()

  // Últimos 12 meses
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    return {
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
      fim: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString(),
    }
  })

  const receitaPorMes = await Promise.all(
    meses.map(async (m) => {
      const { data } = await service
        .from('pagamentos')
        .select('taxa_plataforma, total_pago')
        .gte('criado_em', m.inicio)
        .lte('criado_em', m.fim)
        .eq('status', 'concluido')
      const receita = (data || []).reduce((s: number, p: { taxa_plataforma: number }) => s + p.taxa_plataforma, 0)
      const volume = (data || []).reduce((s: number, p: { total_pago: number }) => s + p.total_pago, 0)
      return { label: m.label, receita, volume }
    })
  )

  // Top 10 lojistas por taxa
  const { data: todosLojistas } = await service
    .from('lojistas')
    .select('id, nome, email, plano')

  const topLojistas = await Promise.all(
    (todosLojistas || []).map(async (l: { id: string; nome: string; email: string; plano: string }) => {
      const { data: pags } = await service
        .from('pagamentos')
        .select('taxa_plataforma, total_pago')
        .eq('lojista_id', l.id)
        .eq('status', 'concluido')
      const taxa = (pags || []).reduce((s: number, p: { taxa_plataforma: number }) => s + p.taxa_plataforma, 0)
      const volume = (pags || []).reduce((s: number, p: { total_pago: number }) => s + p.total_pago, 0)
      return { ...l, taxa, volume }
    })
  )

  topLojistas.sort((a, b) => b.taxa - a.taxa)

  // Totais acumulados
  const [
    { count: totalLojistas },
    { count: totalAfiliados },
    { count: totalVendas },
    { data: todosVolumeVendas },
    { data: todasTaxas },
  ] = await Promise.all([
    service.from('lojistas').select('*', { count: 'exact', head: true }),
    service.from('afiliados').select('*', { count: 'exact', head: true }),
    service.from('vendas').select('*', { count: 'exact', head: true }),
    service.from('vendas').select('valor_comissao'),
    service.from('pagamentos').select('taxa_plataforma').eq('status', 'concluido'),
  ])

  const volumeAcumulado = (todosVolumeVendas || []).reduce((s: number, v: { valor_comissao: number }) => s + v.valor_comissao, 0)
  const receitaAcumulada = (todasTaxas || []).reduce((s: number, p: { taxa_plataforma: number }) => s + p.taxa_plataforma, 0)

  return NextResponse.json({
    receitaPorMes,
    topLojistas: topLojistas.slice(0, 10),
    acumulado: {
      lojistas: totalLojistas || 0,
      afiliados: totalAfiliados || 0,
      vendas: totalVendas || 0,
      volume: volumeAcumulado,
      receita: receitaAcumulada,
    },
  })
}

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
  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
  const em7Dias = new Date(agora.getTime() + 7 * 86400000).toISOString()

  // Métricas gerais
  const [
    { count: totalLojistas },
    { count: emTrial },
    { count: convertidos },
    { data: receitaMes },
    { data: novosPorDia },
    { data: trialsExpirando },
    { data: ultimosCadastros },
  ] = await Promise.all([
    service.from('lojistas').select('*', { count: 'exact', head: true }),
    service
      .from('lojistas')
      .select('*', { count: 'exact', head: true })
      .gt('trial_ate', agora.toISOString())
      .eq('ativo', true),
    service
      .from('lojistas')
      .select('*', { count: 'exact', head: true })
      .lte('trial_ate', agora.toISOString())
      .eq('ativo', true),
    service
      .from('pagamentos')
      .select('taxa_plataforma')
      .gte('criado_em', inicioMes)
      .eq('status', 'concluido'),
    service.rpc('admin_novos_por_dia'),
    service
      .from('lojistas')
      .select('id, nome, email, plano, trial_ate, criado_em')
      .gt('trial_ate', agora.toISOString())
      .lte('trial_ate', em7Dias)
      .eq('ativo', true)
      .order('trial_ate', { ascending: true }),
    service
      .from('lojistas')
      .select('id, nome, email, plano, trial_ate, ativo, criado_em')
      .order('criado_em', { ascending: false })
      .limit(10),
  ])

  const receita = (receitaMes || []).reduce((s: number, p: { taxa_plataforma: number }) => s + p.taxa_plataforma, 0)

  // Para cada trial expirando, buscar contagem de afiliados e vendas
  const trialsComMetricas = await Promise.all(
    (trialsExpirando || []).map(async (l: { id: string; nome: string; email: string; plano: string; trial_ate: string; criado_em: string }) => {
      const [{ count: afiliados }, { count: vendas }] = await Promise.all([
        service.from('afiliados').select('*', { count: 'exact', head: true }).eq('lojista_id', l.id),
        service.from('vendas').select('*', { count: 'exact', head: true }).eq('lojista_id', l.id),
      ])
      return { ...l, afiliados: afiliados || 0, vendas: vendas || 0 }
    })
  )

  return NextResponse.json({
    totalLojistas: totalLojistas || 0,
    emTrial: emTrial || 0,
    convertidos: convertidos || 0,
    receitaMes: receita,
    novosPorDia: novosPorDia || [],
    trialsExpirando: trialsComMetricas,
    ultimosCadastros: ultimosCadastros || [],
  })
}

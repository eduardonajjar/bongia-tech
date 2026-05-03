import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
  }

  const service = await createServiceClient()
  const { searchParams } = new URL(req.url)
  const filtro = searchParams.get('filtro') || 'todos'
  const busca = searchParams.get('busca') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 20

  let query = service
    .from('lojistas')
    .select('id, nome, email, plano, ativo, trial_ate, criado_em, nuvemshop_store_id')
    .order('criado_em', { ascending: false })

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`)
  }

  const agora = new Date().toISOString()
  if (filtro === 'trial') query = query.gt('trial_ate', agora)
  if (filtro === 'starter') query = query.eq('plano', 'starter').lte('trial_ate', agora)
  if (filtro === 'pro') query = query.eq('plano', 'pro')
  if (filtro === 'inativos') query = query.eq('ativo', false)

  const { data: lojistas, count } = await query
    .range((page - 1) * perPage, page * perPage - 1)

  // Buscar métricas para cada lojista
  const comMetricas = await Promise.all(
    (lojistas || []).map(async (l: { id: string; nome: string; email: string; plano: string; ativo: boolean; trial_ate: string; criado_em: string; nuvemshop_store_id: string | null }) => {
      const [
        { count: afiliados },
        { data: vendas },
        { data: pagamentos },
      ] = await Promise.all([
        service.from('afiliados').select('*', { count: 'exact', head: true }).eq('lojista_id', l.id).eq('ativo', true),
        service.from('vendas').select('valor_comissao').eq('lojista_id', l.id),
        service.from('pagamentos').select('taxa_plataforma').eq('lojista_id', l.id).eq('status', 'concluido'),
      ])
      const volume = (vendas || []).reduce((s: number, v: { valor_comissao: number }) => s + v.valor_comissao, 0)
      const taxa = (pagamentos || []).reduce((s: number, p: { taxa_plataforma: number }) => s + p.taxa_plataforma, 0)
      return { ...l, afiliados: afiliados || 0, volume, taxa }
    })
  )

  return NextResponse.json({ lojistas: comMetricas, total: count || 0, page, perPage })
}

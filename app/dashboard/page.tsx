import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, Users, ShoppingBag, DollarSign, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()

  const [vendasMes, afiliados, saldoPendente] = await Promise.all([
    supabase
      .from('vendas')
      .select('valor_pedido, valor_comissao, status')
      .eq('lojista_id', user!.id)
      .gte('criado_em', inicioMes)
      .neq('status', 'cancelado'),
    supabase
      .from('afiliados')
      .select('id, nome, total_vendas, saldo, ativo, criado_em')
      .eq('lojista_id', user!.id)
      .order('total_vendas', { ascending: false }),
    supabase
      .from('afiliados')
      .select('saldo')
      .eq('lojista_id', user!.id)
      .eq('ativo', true)
      .gt('saldo', 0),
  ])

  const totalVendasMes = vendasMes.data?.reduce((s, v) => s + v.valor_pedido, 0) || 0
  const totalComissoesMes = vendasMes.data?.reduce((s, v) => s + v.valor_comissao, 0) || 0
  const numVendasMes = vendasMes.data?.length || 0
  const afiliadosAtivos = afiliados.data?.filter((a) => a.ativo).length || 0
  const totalSaldo = saldoPendente.data?.reduce((s, a) => s + a.saldo, 0) || 0

  const top5 = afiliados.data?.slice(0, 5) || []

  // Aviso se há comissões pendentes há mais de 30 dias
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: pendentesAntigos } = await supabase
    .from('afiliados')
    .select('id')
    .eq('lojista_id', user!.id)
    .gt('saldo', 0)
    .lt('criado_em', trintaDiasAtras)
    .limit(1)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Visão Geral</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>{formatDate(hoje)} · Este mês</p>
      </div>

      {pendentesAntigos && pendentesAntigos.length > 0 && totalSaldo > 0 && (
        <div style={{
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
          padding: '1rem',
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', color: '#d97706', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#d97706' }}>Há comissões pendentes de pagamento há mais de 30 dias</p>
            <a href="/dashboard/pagamentos" style={{ fontSize: '12px', color: '#d97706', textDecoration: 'underline', fontWeight: 300 }}>Pagar agora →</a>
          </div>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          {
            label: 'Vendas via afiliados (mês)',
            value: formatCurrency(totalVendasMes),
            sub: `${numVendasMes} pedidos`,
            icon: TrendingUp,
          },
          {
            label: 'Comissões geradas (mês)',
            value: formatCurrency(totalComissoesMes),
            sub: 'Total acumulado',
            icon: DollarSign,
          },
          {
            label: 'Afiliados ativos',
            value: String(afiliadosAtivos),
            sub: 'Com link ativo',
            icon: Users,
          },
          {
            label: 'A pagar (saldo total)',
            value: formatCurrency(totalSaldo),
            sub: 'Em carteira dos afiliados',
            icon: ShoppingBag,
          },
        ].map((card) => (
          <div key={card.label} style={{ background: '#111010', padding: '1.5rem' }}>
            <card.icon style={{ width: '16px', height: '16px', color: '#6b6560', marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: '#f5f3f0', marginBottom: '4px' }}>{card.value}</p>
            <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300 }}>{card.label}</p>
            <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Top afiliados */}
      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>Top Afiliados</h2>
          <a href="/dashboard/afiliados" style={{ fontSize: '12px', color: '#6b6560', textDecoration: 'none', fontWeight: 300 }}>Ver todos →</a>
        </div>
        {top5.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6560' }}>
            <Users style={{ width: '40px', height: '40px', margin: '0 auto 0.75rem', opacity: 0.2 }} />
            <p style={{ fontSize: '13px', fontWeight: 300 }}>Nenhum afiliado ainda.</p>
            <a href="/dashboard/afiliados" style={{ color: '#f5f3f0', fontSize: '12px', textDecoration: 'underline', marginTop: '4px', display: 'block', fontWeight: 300 }}>
              Adicionar primeiro afiliado →
            </a>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Afiliado', 'Total em vendas', 'Comissão a pagar', 'Status'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 400, color: '#4a4440',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top5.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{a.nome}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{formatCurrency(a.total_vendas)}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(a.saldo)}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', fontSize: '11px', fontWeight: 400,
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: a.ativo ? '#f5f3f0' : '#6b6560',
                    }}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

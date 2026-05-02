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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 text-sm mt-1">{formatDate(hoje)} · Este mês</p>
      </div>

      {pendentesAntigos && pendentesAntigos.length > 0 && totalSaldo > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Há comissões pendentes de pagamento há mais de 30 dias</p>
            <a href="/dashboard/pagamentos" className="text-sm text-amber-700 underline">Pagar agora →</a>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          {
            label: 'Vendas via afiliados (mês)',
            value: formatCurrency(totalVendasMes),
            sub: `${numVendasMes} pedidos`,
            icon: TrendingUp,
            color: 'text-violet-600 bg-violet-50',
          },
          {
            label: 'Comissões geradas (mês)',
            value: formatCurrency(totalComissoesMes),
            sub: 'Total acumulado',
            icon: DollarSign,
            color: 'text-green-600 bg-green-50',
          },
          {
            label: 'Afiliados ativos',
            value: String(afiliadosAtivos),
            sub: 'Com link ativo',
            icon: Users,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'A pagar (saldo total)',
            value: formatCurrency(totalSaldo),
            sub: 'Em carteira dos afiliados',
            icon: ShoppingBag,
            color: 'text-orange-600 bg-orange-50',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Top afiliados */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Top Afiliados</h2>
          <a href="/dashboard/afiliados" className="text-sm text-violet-600 hover:underline">Ver todos →</a>
        </div>
        {top5.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum afiliado ainda.</p>
            <a href="/dashboard/afiliados" className="text-violet-600 text-sm hover:underline mt-1 block">
              Adicionar primeiro afiliado →
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Afiliado', 'Total em vendas', 'Comissão a pagar', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {top5.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{a.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(a.total_vendas)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-700">{formatCurrency(a.saldo)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      a.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
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

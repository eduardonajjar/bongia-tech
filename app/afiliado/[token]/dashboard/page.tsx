import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Copy, TrendingUp, MousePointerClick, ShoppingBag, DollarSign, CheckCircle } from 'lucide-react'
import CopiarLink from './CopiarLink'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function AfiliadoDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServiceClient()

  const { data: afiliado } = await supabase
    .from('afiliados')
    .select('*, lojistas(nome)')
    .eq('token', token)
    .eq('ativo', true)
    .single()

  if (!afiliado) notFound()

  const { data: vendas } = await supabase
    .from('vendas')
    .select('*')
    .eq('afiliado_id', afiliado.id)
    .order('criado_em', { ascending: false })
    .limit(50)

  const { data: pagamentosAfiliado } = await supabase
    .from('pagamentos_afiliados')
    .select('*')
    .eq('afiliado_id', afiliado.id)
    .eq('status', 'concluido')
    .order('criado_em', { ascending: false })
    .limit(20)

  const totalRecebido = pagamentosAfiliado?.reduce((s, p) => s + p.valor, 0) || 0
  const linkAfiliado = `${APP_URL}/loja?ref=${afiliado.ref_code}`
  const loja = afiliado.lojistas as { nome: string } | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">
              Bongia<span className="text-violet-600">Tech</span>
            </h1>
            {loja && <p className="text-xs text-gray-500">Afiliado de {loja.nome}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{afiliado.nome}</p>
            <p className="text-xs text-gray-500">{afiliado.email}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Seu link */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Seu link de afiliado</h2>
          <CopiarLink link={linkAfiliado} refCode={afiliado.ref_code} />
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Cliques no link',
              value: String(afiliado.total_cliques),
              icon: MousePointerClick,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              label: 'Vendas geradas',
              value: String(vendas?.length || 0),
              icon: ShoppingBag,
              color: 'text-violet-600 bg-violet-50',
            },
            {
              label: 'A receber',
              value: formatCurrency(afiliado.saldo),
              icon: TrendingUp,
              color: 'text-orange-600 bg-orange-50',
            },
            {
              label: 'Total recebido',
              value: formatCurrency(totalRecebido),
              icon: DollarSign,
              color: 'text-green-600 bg-green-50',
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                <card.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Histórico de vendas */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Minhas vendas</h2>
          </div>
          {!vendas || vendas.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhuma venda rastreada ainda. Compartilhe seu link para começar!
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Data', 'Valor do pedido', 'Sua comissão', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(v.criado_em)}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{formatCurrency(v.valor_pedido)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-green-700">{formatCurrency(v.valor_comissao)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        v.status === 'pago' ? 'bg-green-100 text-green-700' :
                        v.status === 'confirmado' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {v.status === 'pago' ? 'Pago' : v.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Histórico de PIX recebidos */}
        {pagamentosAfiliado && pagamentosAfiliado.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">PIX recebidos</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Data', 'Valor recebido'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagamentosAfiliado.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(p.criado_em)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-green-700">{formatCurrency(p.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

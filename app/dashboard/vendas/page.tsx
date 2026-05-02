import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  pago: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

export default async function VendasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vendas } = await supabase
    .from('vendas')
    .select('*, afiliados(nome, email)')
    .eq('lojista_id', user!.id)
    .order('criado_em', { ascending: false })
    .limit(200)

  const total = vendas?.reduce((s, v) => s + v.valor_pedido, 0) || 0
  const totalComissoes = vendas?.reduce((s, v) => s + v.valor_comissao, 0) || 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <p className="text-gray-500 text-sm mt-1">
          {vendas?.length || 0} vendas · Total em vendas: {formatCurrency(total)} · Comissões: {formatCurrency(totalComissoes)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {!vendas || vendas.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Nenhuma venda rastreada ainda</p>
            <p className="text-sm mt-1">As vendas aparecerão aqui quando alguém comprar pelo link de um afiliado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Data', 'Afiliado', 'Pedido ID', 'Valor do pedido', 'Comissão', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendas.map((v) => {
                  const status = STATUS_LABEL[v.status] || STATUS_LABEL.pendente
                  const afiliado = v.afiliados as { nome: string } | null
                  return (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(v.criado_em)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {afiliado?.nome || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        #{v.pedido_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatCurrency(v.valor_pedido)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-700">
                        {formatCurrency(v.valor_comissao)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

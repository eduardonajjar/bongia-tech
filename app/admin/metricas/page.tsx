'use client'

import { useEffect, useState } from 'react'

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

interface MesPonto { label: string; receita: number; volume: number }
interface TopLojista { id: string; nome: string; email: string; plano: string; taxa: number; volume: number }
interface Acumulado { lojistas: number; afiliados: number; vendas: number; volume: number; receita: number }

function BarChart({
  data, valueKey, color,
}: {
  data: Record<string, number | string>[]
  valueKey: string
  color: string
}) {
  const vals = data.map((d) => Number(d[valueKey]))
  const max = Math.max(...vals, 1)
  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t min-h-[2px] transition-all"
            style={{
              height: `${(vals[i] / max) * 100}%`,
              backgroundColor: color,
              opacity: 0.8,
            }}
            title={`${d.label}: ${fmt(vals[i])}`}
          />
          <span className="text-gray-400" style={{ fontSize: 9, writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
            {String(d.label)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminMetricasPage() {
  const [dados, setDados] = useState<{
    receitaPorMes: MesPonto[]
    topLojistas: TopLojista[]
    acumulado: Acumulado
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/metricas').then((r) => r.json()).then(setDados).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Carregando...</div>
  if (!dados) return null

  const { receitaPorMes, topLojistas, acumulado } = dados

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
        <p className="text-gray-500 text-sm mt-1">Receita e volume dos últimos 12 meses</p>
      </div>

      {/* Totais acumulados */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Lojistas', value: acumulado.lojistas },
          { label: 'Afiliados', value: acumulado.afiliados },
          { label: 'Vendas rastreadas', value: acumulado.vendas },
          { label: 'Volume em comissões', value: fmt(acumulado.volume) },
          { label: 'Receita da plataforma', value: fmt(acumulado.receita) },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className="text-xl font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Receita da plataforma</h2>
          <p className="text-xs text-gray-400 mb-4">Últimos 12 meses (3% sobre PIX)</p>
          <BarChart data={receitaPorMes} valueKey="receita" color="#7c3aed" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Volume transacionado</h2>
          <p className="text-xs text-gray-400 mb-4">Últimos 12 meses (total de comissões pagas)</p>
          <BarChart data={receitaPorMes} valueKey="volume" color="#059669" />
        </div>
      </div>

      {/* Top 10 lojistas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top 10 lojistas por receita gerada</h2>
        {topLojistas.filter((l) => l.taxa > 0).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Nenhum lojista fez pagamento via PIX ainda
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Lojista</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Plano</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Volume</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Taxa gerada</th>
              </tr>
            </thead>
            <tbody>
              {topLojistas.filter((l) => l.taxa > 0).map((l, i) => (
                <tr key={l.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-400 font-mono text-xs">#{i + 1}</td>
                  <td className="py-2.5">
                    <p className="font-medium text-gray-900">{l.nome}</p>
                    <p className="text-xs text-gray-400">{l.email}</p>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      l.plano === 'pro' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {l.plano}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-gray-700">{fmt(l.volume)}</td>
                  <td className="py-2.5 text-right font-bold text-green-700">{fmt(l.taxa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

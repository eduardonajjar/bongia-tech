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
  data: MesPonto[]
  valueKey: keyof MesPonto
  color: string
}) {
  const vals = data.map((d) => Number(d[valueKey]))
  const max = Math.max(...vals, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', width: '100%' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '100%', minHeight: '2px',
              height: `${(vals[i] / max) * 100}%`,
              background: color, opacity: 0.8,
            }}
            title={`${String(d.label)}: ${fmt(vals[i])}`}
          />
          <span style={{ color: '#4a4440', fontSize: '9px', writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
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

  if (loading) return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando...</div>
  if (!dados) return null

  const { receitaPorMes, topLojistas, acumulado } = dados

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Métricas</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>Receita e volume dos últimos 12 meses</p>
      </div>

      {/* Totais acumulados */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1px', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Lojistas', value: acumulado.lojistas },
          { label: 'Afiliados', value: acumulado.afiliados },
          { label: 'Vendas rastreadas', value: acumulado.vendas },
          { label: 'Volume em comissões', value: fmt(acumulado.volume) },
          { label: 'Receita da plataforma', value: fmt(acumulado.receita) },
        ].map((m) => (
          <div key={m.label} style={{ background: '#111010', padding: '1.5rem' }}>
            <p style={{ fontSize: '11px', color: '#4a4440', marginBottom: '6px', fontWeight: 300 }}>{m.label}</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: '#f5f3f0' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '4px' }}>Receita da plataforma</h2>
          <p style={{ fontSize: '11px', color: '#4a4440', marginBottom: '1rem', fontWeight: 300 }}>Últimos 12 meses (3% sobre PIX)</p>
          <BarChart data={receitaPorMes} valueKey="receita" color="#7c3aed" />
        </div>

        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '4px' }}>Volume transacionado</h2>
          <p style={{ fontSize: '11px', color: '#4a4440', marginBottom: '1rem', fontWeight: 300 }}>Últimos 12 meses (total de comissões pagas)</p>
          <BarChart data={receitaPorMes} valueKey="volume" color="#059669" />
        </div>
      </div>

      {/* Top 10 lojistas */}
      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1rem' }}>Top 10 lojistas por receita gerada</h2>
        {topLojistas.filter((l) => l.taxa > 0).length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6b6560', textAlign: 'center', padding: '2rem 0', fontWeight: 300 }}>
            Nenhum lojista fez pagamento via PIX ainda
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['#', 'Lojista', 'Plano', 'Volume', 'Taxa gerada'].map((h) => (
                  <th key={h} style={{
                    padding: '8px 0', textAlign: h === 'Volume' || h === 'Taxa gerada' ? 'right' : 'left',
                    fontSize: '10px', fontWeight: 400, color: '#4a4440',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topLojistas.filter((l) => l.taxa > 0).map((l, i) => (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 0', color: '#4a4440', fontFamily: 'monospace', fontSize: '11px', fontWeight: 300 }}>#{i + 1}</td>
                  <td style={{ padding: '10px 0' }}>
                    <p style={{ fontWeight: 400, color: '#f5f3f0' }}>{l.nome}</p>
                    <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>{l.email}</p>
                  </td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: l.plano === 'pro' ? '#7c3aed' : '#6b6560', fontWeight: 400,
                    }}>
                      {l.plano}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#6b6560', fontWeight: 300 }}>{fmt(l.volume)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500, color: '#f5f3f0' }}>{fmt(l.taxa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

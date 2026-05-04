'use client'

import { useEffect, useState } from 'react'
import { Users, TrendingUp, Clock, DollarSign, Mail } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const fmtData = (s: string) =>
  new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

interface Stats {
  totalLojistas: number
  emTrial: number
  convertidos: number
  receitaMes: number
  novosPorDia: { dia: string; total: number }[]
  trialsExpirando: {
    id: string; nome: string; email: string; plano: string
    trial_ate: string; afiliados: number; vendas: number
  }[]
  ultimosCadastros: {
    id: string; nome: string; email: string; plano: string
    trial_ate: string; ativo: boolean; criado_em: string
  }[]
}

function MiniBar({ data }: { data: { dia: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '64px', width: '100%' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div
            style={{
              width: '100%', background: '#7c3aed', minHeight: '2px',
              height: `${(d.total / max) * 100}%`, opacity: 0.7,
            }}
            title={`${fmtData(d.dia)}: ${d.total}`}
          />
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailEnviando, setEmailEnviando] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats).finally(() => setLoading(false))
  }, [])

  async function enviarEmail(email: string, nome: string) {
    setEmailEnviando(email)
    await fetch('/api/admin/email-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nome }),
    })
    setEmailEnviando(null)
    alert(`Email enviado para ${nome}`)
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando métricas...</div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Visão Geral</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>Dados em tempo real da plataforma</p>
      </div>

      {/* Cards de métricas */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Total de lojistas', value: stats.totalLojistas, icon: Users },
          { label: 'Em trial agora', value: stats.emTrial, icon: Clock },
          { label: 'Convertidos', value: stats.convertidos, icon: TrendingUp },
          { label: 'Receita do mês', value: fmt(stats.receitaMes), icon: DollarSign },
        ].map((c) => (
          <div key={c.label} style={{ background: '#111010', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300 }}>{c.label}</span>
              <c.icon style={{ width: '14px', height: '14px', color: '#4a4440' }} />
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: '#f5f3f0' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico novos cadastros */}
      {stats.novosPorDia.length > 0 && (
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1rem' }}>Novos cadastros — últimos 30 dias</h2>
          <MiniBar data={stats.novosPorDia} />
          <p style={{ fontSize: '11px', color: '#4a4440', marginTop: '8px', fontWeight: 300 }}>Cada coluna = 1 dia</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Trials expirando */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '4px' }}>Trials expirando em 7 dias</h2>
          <p style={{ fontSize: '11px', color: '#4a4440', marginBottom: '1rem', fontWeight: 300 }}>Leads mais quentes para conversão</p>
          {stats.trialsExpirando.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6b6560', textAlign: 'center', padding: '1.5rem 0', fontWeight: 300 }}>Nenhum trial expirando em breve</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.trialsExpirando.map((l) => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{l.nome}</p>
                    <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>
                      {l.email} · expira {fmtData(l.trial_ate)} · {l.afiliados} afil. · {l.vendas} vendas
                    </p>
                  </div>
                  <button
                    onClick={() => enviarEmail(l.email, l.nome)}
                    disabled={emailEnviando === l.email}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', cursor: 'pointer',
                      background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
                      color: '#d97706', padding: '4px 8px', fontWeight: 400,
                      opacity: emailEnviando === l.email ? 0.5 : 1,
                    }}
                  >
                    <Mail style={{ width: '12px', height: '12px' }} />
                    {emailEnviando === l.email ? 'Enviando...' : 'Email'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos cadastros */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1rem' }}>Últimos cadastros</h2>
          {stats.ultimosCadastros.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6b6560', textAlign: 'center', padding: '1.5rem 0', fontWeight: 300 }}>Sem cadastros ainda</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.ultimosCadastros.map((l) => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{l.nome}</p>
                    <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>{l.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: l.plano === 'pro' ? '#7c3aed' : '#6b6560', fontWeight: 400,
                    }}>
                      {l.plano}
                    </span>
                    <p style={{ fontSize: '11px', color: '#4a4440', marginTop: '2px', fontWeight: 300 }}>{fmtData(l.criado_em)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

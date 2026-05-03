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
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full bg-violet-400 rounded-sm min-h-[2px]"
            style={{ height: `${(d.total / max) * 100}%` }}
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
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400">Carregando métricas...</div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 text-sm mt-1">Dados em tempo real da plataforma</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de lojistas', value: stats.totalLojistas, icon: Users, color: 'violet' },
          { label: 'Em trial agora', value: stats.emTrial, icon: Clock, color: 'amber' },
          { label: 'Convertidos', value: stats.convertidos, icon: TrendingUp, color: 'green' },
          { label: 'Receita do mês', value: fmt(stats.receitaMes), icon: DollarSign, color: 'blue' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{c.label}</span>
              <c.icon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico novos cadastros */}
      {stats.novosPorDia.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Novos cadastros — últimos 30 dias</h2>
          <MiniBar data={stats.novosPorDia} />
          <p className="text-xs text-gray-400 mt-2">Cada coluna = 1 dia</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Trials expirando */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Trials expirando em 7 dias</h2>
          <p className="text-xs text-gray-400 mb-4">Leads mais quentes para conversão</p>
          {stats.trialsExpirando.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum trial expirando em breve</p>
          ) : (
            <div className="space-y-3">
              {stats.trialsExpirando.map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.nome}</p>
                    <p className="text-xs text-gray-400">
                      {l.email} · expira {fmtData(l.trial_ate)} · {l.afiliados} afil. · {l.vendas} vendas
                    </p>
                  </div>
                  <button
                    onClick={() => enviarEmail(l.email, l.nome)}
                    disabled={emailEnviando === l.email}
                    className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-3 h-3" />
                    {emailEnviando === l.email ? 'Enviando...' : 'Email'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos cadastros */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Últimos cadastros</h2>
          {stats.ultimosCadastros.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sem cadastros ainda</p>
          ) : (
            <div className="space-y-3">
              {stats.ultimosCadastros.map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.nome}</p>
                    <p className="text-xs text-gray-400">{l.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      l.plano === 'pro' ? 'bg-violet-100 text-violet-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {l.plano}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtData(l.criado_em)}</p>
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

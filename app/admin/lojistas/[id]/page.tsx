'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const fmtData = (s: string) =>
  new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })

interface Lojista {
  id: string; nome: string; email: string; plano: string; ativo: boolean
  trial_ate: string; criado_em: string; nuvemshop_store_id: string | null
  pagamento_automatico_ativo: boolean; onboarding_concluido: boolean
}

interface Metricas {
  totalAfiliados: number; totalVendas: number; volumeTotal: number; pedidoTotal: number; taxaTotal: number
}

interface Pagamento {
  id: string; total_pago: number; taxa_plataforma: number
  afiliados_pagos: number; status: string; criado_em: string
}

export default function LojistDetalhe() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [lojista, setLojista] = useState<Lojista | null>(null)
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)

  const [novoPlano, setNovoPlano] = useState('')
  const [novoTrial, setNovoTrial] = useState('')
  const [salvando, setSalvando] = useState<string | null>(null)
  const [confirmarDesativar, setConfirmarDesativar] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/lojistas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLojista(data.lojista)
        setMetricas(data.metricas)
        setPagamentos(data.pagamentos || [])
        setNovoPlano(data.lojista?.plano || 'starter')
        setNovoTrial(data.lojista?.trial_ate ? data.lojista.trial_ate.split('T')[0] : '')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function salvar(campo: string, updates: Record<string, unknown>) {
    setSalvando(campo)
    await fetch(`/api/admin/lojistas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setSalvando(null)
    if (campo === 'desativar') router.push('/admin/lojistas')
  }

  if (loading) {
    return <div className="p-8 text-gray-400">Carregando...</div>
  }

  if (!lojista) {
    return <div className="p-8 text-gray-400">Lojista não encontrado</div>
  }

  const emTrial = lojista.trial_ate && new Date(lojista.trial_ate) > new Date()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lojista.nome}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{lojista.email}</p>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              lojista.plano === 'pro' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {lojista.plano}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              !lojista.ativo ? 'bg-red-100 text-red-700' :
              emTrial ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {!lojista.ativo ? 'Inativo' : emTrial ? 'Em trial' : 'Ativo'}
            </span>
            {lojista.nuvemshop_store_id && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                Nuvemshop conectada
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400">Cadastrado em {fmtData(lojista.criado_em)}</p>
      </div>

      {/* Métricas */}
      {metricas && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Afiliados', value: metricas.totalAfiliados },
            { label: 'Vendas rastreadas', value: metricas.totalVendas },
            { label: 'Comissões geradas', value: fmt(metricas.volumeTotal) },
            { label: 'Taxa p/ plataforma', value: fmt(metricas.taxaTotal) },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-xl font-bold text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controles manuais */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Controles manuais</h2>
        <div className="grid grid-cols-3 gap-6">

          {/* Mudar plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
            <select
              value={novoPlano}
              onChange={(e) => setNovoPlano(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mb-3"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
            <button
              onClick={() => salvar('plano', { plano: novoPlano })}
              disabled={salvando === 'plano' || novoPlano === lojista.plano}
              className="flex items-center gap-1 text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors w-full justify-center"
            >
              <Save className="w-3.5 h-3.5" />
              {salvando === 'plano' ? 'Salvando...' : 'Salvar plano'}
            </button>
          </div>

          {/* Estender trial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trial até</label>
            <input
              type="date"
              value={novoTrial}
              onChange={(e) => setNovoTrial(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mb-3"
            />
            <button
              onClick={() => salvar('trial', { trial_ate: new Date(novoTrial).toISOString() })}
              disabled={salvando === 'trial' || !novoTrial}
              className="flex items-center gap-1 text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors w-full justify-center"
            >
              <Save className="w-3.5 h-3.5" />
              {salvando === 'trial' ? 'Salvando...' : 'Estender trial'}
            </button>
          </div>

          {/* Desativar conta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conta</label>
            <p className="text-xs text-gray-400 mb-3">
              {lojista.ativo
                ? 'Desativar bloqueia o acesso ao dashboard.'
                : 'Conta está desativada.'}
            </p>
            {!confirmarDesativar ? (
              <button
                onClick={() => setConfirmarDesativar(true)}
                disabled={!lojista.ativo}
                className="flex items-center gap-1 text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors w-full justify-center"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Desativar conta
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-600 font-medium">Tem certeza?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => salvar('desativar', { ativo: false })}
                    disabled={salvando === 'desativar'}
                    className="flex-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Sim, desativar
                  </button>
                  <button
                    onClick={() => setConfirmarDesativar(false)}
                    className="flex-1 text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Últimos pagamentos processados</h2>
        {pagamentos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum pagamento ainda</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Total pago</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Afiliados</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Taxa</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-500">{fmtData(p.criado_em)}</td>
                  <td className="py-2.5 text-right font-medium text-gray-900">{fmt(p.total_pago)}</td>
                  <td className="py-2.5 text-right text-gray-600">{p.afiliados_pagos}</td>
                  <td className="py-2.5 text-right text-green-700 font-medium">{fmt(p.taxa_plataforma)}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      p.status === 'erro' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
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

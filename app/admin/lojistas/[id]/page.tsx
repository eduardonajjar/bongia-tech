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

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
  padding: '8px 12px', fontSize: '13px', outline: 'none',
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
    return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando...</div>
  }

  if (!lojista) {
    return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Lojista não encontrado</div>
  }

  const emTrial = lojista.trial_ate && new Date(lojista.trial_ate) > new Date()

  return (
    <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: '#6b6560', background: 'none', border: 'none',
          cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 300,
        }}
        className="back-btn"
      >
        <ArrowLeft style={{ width: '14px', height: '14px' }} /> Voltar
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>{lojista.nome}</h1>
          <p style={{ color: '#6b6560', fontSize: '13px', marginTop: '4px', fontWeight: 300 }}>{lojista.email}</p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <span style={{
              fontSize: '11px', padding: '2px 8px',
              border: '1px solid rgba(255,255,255,0.07)',
              color: lojista.plano === 'pro' ? '#7c3aed' : '#6b6560', fontWeight: 400,
            }}>
              {lojista.plano}
            </span>
            <span style={{
              fontSize: '11px', padding: '2px 8px',
              border: '1px solid rgba(255,255,255,0.07)',
              color: !lojista.ativo ? '#f87171' : emTrial ? '#d97706' : '#4ade80', fontWeight: 400,
            }}>
              {!lojista.ativo ? 'Inativo' : emTrial ? 'Em trial' : 'Ativo'}
            </span>
            {lojista.nuvemshop_store_id && (
              <span style={{
                fontSize: '11px', padding: '2px 8px',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#6b6560', fontWeight: 400,
              }}>
                Nuvemshop conectada
              </span>
            )}
          </div>
        </div>
        <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>Cadastrado em {fmtData(lojista.criado_em)}</p>
      </div>

      {/* Métricas */}
      {metricas && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Afiliados', value: metricas.totalAfiliados },
            { label: 'Vendas rastreadas', value: metricas.totalVendas },
            { label: 'Comissões geradas', value: fmt(metricas.volumeTotal) },
            { label: 'Taxa p/ plataforma', value: fmt(metricas.taxaTotal) },
          ].map((m) => (
            <div key={m.label} style={{ background: '#111010', padding: '1.5rem' }}>
              <p style={{ fontSize: '11px', color: '#4a4440', marginBottom: '6px', fontWeight: 300 }}>{m.label}</p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: '#f5f3f0' }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controles manuais */}
      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1.5rem' }}>Controles manuais</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>

          {/* Mudar plano */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '8px', fontWeight: 400 }}>Plano</label>
            <select
              value={novoPlano}
              onChange={(e) => setNovoPlano(e.target.value)}
              style={{ ...inputStyle, marginBottom: '12px' }}
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
            <button
              onClick={() => salvar('plano', { plano: novoPlano })}
              disabled={salvando === 'plano' || novoPlano === lojista.plano}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                width: '100%', fontSize: '13px', background: '#7c3aed', color: '#fff',
                padding: '8px', border: 'none', cursor: 'pointer', fontWeight: 500,
                opacity: (salvando === 'plano' || novoPlano === lojista.plano) ? 0.5 : 1,
              }}
            >
              <Save style={{ width: '12px', height: '12px' }} />
              {salvando === 'plano' ? 'Salvando...' : 'Salvar plano'}
            </button>
          </div>

          {/* Estender trial */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '8px', fontWeight: 400 }}>Trial até</label>
            <input
              type="date"
              value={novoTrial}
              onChange={(e) => setNovoTrial(e.target.value)}
              style={{ ...inputStyle, marginBottom: '12px' }}
            />
            <button
              onClick={() => salvar('trial', { trial_ate: new Date(novoTrial).toISOString() })}
              disabled={salvando === 'trial' || !novoTrial}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                width: '100%', fontSize: '13px', background: '#d97706', color: '#fff',
                padding: '8px', border: 'none', cursor: 'pointer', fontWeight: 500,
                opacity: (salvando === 'trial' || !novoTrial) ? 0.5 : 1,
              }}
            >
              <Save style={{ width: '12px', height: '12px' }} />
              {salvando === 'trial' ? 'Salvando...' : 'Estender trial'}
            </button>
          </div>

          {/* Desativar conta */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '8px', fontWeight: 400 }}>Conta</label>
            <p style={{ fontSize: '11px', color: '#4a4440', marginBottom: '12px', fontWeight: 300 }}>
              {lojista.ativo
                ? 'Desativar bloqueia o acesso ao dashboard.'
                : 'Conta está desativada.'}
            </p>
            {!confirmarDesativar ? (
              <button
                onClick={() => setConfirmarDesativar(true)}
                disabled={!lojista.ativo}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                  width: '100%', fontSize: '13px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', padding: '8px', cursor: 'pointer', fontWeight: 400,
                  opacity: !lojista.ativo ? 0.4 : 1,
                }}
              >
                <AlertTriangle style={{ width: '12px', height: '12px' }} />
                Desativar conta
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '12px', color: '#f87171', fontWeight: 500 }}>Tem certeza?</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => salvar('desativar', { ativo: false })}
                    disabled={salvando === 'desativar'}
                    style={{
                      flex: 1, fontSize: '12px', background: '#ef4444', color: '#fff',
                      padding: '6px', border: 'none', cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    Sim, desativar
                  </button>
                  <button
                    onClick={() => setConfirmarDesativar(false)}
                    style={{
                      flex: 1, fontSize: '12px', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#6b6560',
                      padding: '6px', cursor: 'pointer', fontWeight: 300,
                    }}
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
      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1rem' }}>Últimos pagamentos processados</h2>
        {pagamentos.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6b6560', textAlign: 'center', padding: '1.5rem 0', fontWeight: 300 }}>Nenhum pagamento ainda</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Data', 'Total pago', 'Afiliados', 'Taxa', 'Status'].map((h) => (
                  <th key={h} style={{
                    padding: '8px 0', textAlign: h === 'Total pago' || h === 'Afiliados' || h === 'Taxa' ? 'right' : 'left',
                    fontSize: '10px', fontWeight: 400, color: '#4a4440',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 0', color: '#6b6560', fontWeight: 300 }}>{fmtData(p.criado_em)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500, color: '#f5f3f0' }}>{fmt(p.total_pago)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#6b6560', fontWeight: 300 }}>{p.afiliados_pagos}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 400, color: '#f5f3f0' }}>{fmt(p.taxa_plataforma)}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: p.status === 'concluido' ? '#4ade80' : p.status === 'erro' ? '#f87171' : '#d97706',
                      fontWeight: 400,
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .back-btn:hover { color: #f5f3f0 !important; }
      `}</style>
    </div>
  )
}

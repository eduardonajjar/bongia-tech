'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CreditCard, AlertCircle, CheckCircle, Loader2, Download, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AfiliadoPendente {
  id: string
  nome: string
  email: string
  saldo: number
  chave_pix: string | null
  total_vendas_count?: number
  selecionado: boolean
}

interface Pagamento {
  id: string
  total_pago: number
  taxa_plataforma: number
  afiliados_pagos: number
  status: string
  criado_em: string
}

interface Lojista {
  plano: string
  pagamento_automatico_ativo: boolean
  asaas_api_key: string | null
}

const TAXA = 0.03

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
  padding: '8px 12px', fontSize: '13px', outline: 'none',
}

export default function PagamentosPage() {
  const [pendentes, setPendentes] = useState<AfiliadoPendente[]>([])
  const [historico, setHistorico] = useState<Pagamento[]>([])
  const [lojista, setLojista] = useState<Lojista | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [resAfiliados, resPagamentos, resLojista] = await Promise.all([
      fetch('/api/afiliados'),
      fetch('/api/pagamentos'),
      supabase
        .from('lojistas')
        .select('plano, pagamento_automatico_ativo, asaas_api_key')
        .eq('id', user.id)
        .single(),
    ])

    const afiliados = await resAfiliados.json()
    const pags = await resPagamentos.json()

    setPendentes(
      afiliados
        .filter((a: AfiliadoPendente) => a.saldo > 0)
        .map((a: AfiliadoPendente) => ({ ...a, selecionado: true }))
    )
    setHistorico(pags)
    setLojista(resLojista.data)
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const selecionados = pendentes.filter((a) => a.selecionado)
  const totalSaldo = selecionados.reduce((s, a) => s + a.saldo, 0)
  const taxaPlataforma = totalSaldo * TAXA
  const isPro = lojista?.pagamento_automatico_ativo === true

  function toggleAfiliado(id: string) {
    setPendentes((prev) =>
      prev.map((a) => a.id === id ? { ...a, selecionado: !a.selecionado } : a)
    )
  }

  function exportarCSV() {
    const header = 'Nome,Email,Chave PIX,Valor a Receber (R$)'
    const rows = pendentes.map((a) =>
      `"${a.nome}","${a.email}","${a.chave_pix || 'Sem chave PIX'}","${a.saldo.toFixed(2)}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `afiliados-pagamento-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function confirmarPagamento() {
    setPagando(true)
    const ids = selecionados.map((a) => a.id)

    const res = await fetch('/api/pagamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afiliado_ids: ids }),
    })
    const data = await res.json()
    setPagando(false)
    setModalAberto(false)

    if (res.ok) {
      setResultado({
        ok: true,
        msg: `PIX enviado para ${data.afiliados_pagos} afiliados! Total: ${formatCurrency(data.total_pago)}`,
      })
      carregar()
    } else {
      setResultado({ ok: false, msg: data.erro || 'Erro ao processar pagamento' })
    }
    setTimeout(() => setResultado(null), 6000)
  }

  if (carregando) return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando...</div>

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Pagamentos</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>
          {isPro ? 'Pague todos os afiliados de uma vez via PIX' : 'Veja quanto deve para cada afiliado e pague manualmente'}
        </p>
      </div>

      {resultado && (
        <div style={{
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem', border: `1px solid ${resultado.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          background: resultado.ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        }}>
          {resultado.ok
            ? <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e', flexShrink: 0 }} />
            : <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />}
          <p style={{ fontSize: '13px', fontWeight: 400, color: resultado.ok ? '#4ade80' : '#f87171' }}>
            {resultado.msg}
          </p>
        </div>
      )}

      {/* Banner upgrade para Starter */}
      {!isPro && (
        <div style={{
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#7c3aed', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>Quer pagar todos em 1 clique?</p>
              <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '2px', fontWeight: 300 }}>Faça upgrade para o plano Pro e pague via PIX automático.</p>
            </div>
          </div>
          <a
            href="/dashboard/configuracoes"
            style={{
              flexShrink: 0, background: '#7c3aed', color: '#fff',
              fontSize: '12px', fontWeight: 500, padding: '6px 14px',
              textDecoration: 'none',
            }}
          >
            Ver plano Pro
          </a>
        </div>
      )}

      {/* Seção a pagar */}
      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '2rem' }}>
        <div style={{
          padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>
              {isPro ? 'A pagar agora' : 'Pague seus afiliados manualmente'}
            </h2>
            <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '2px', fontWeight: 300 }}>
              {pendentes.length} afiliados · Total: {formatCurrency(pendentes.reduce((s, a) => s + a.saldo, 0))}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {pendentes.length > 0 && (
              <button
                onClick={exportarCSV}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#6b6560', padding: '8px 14px', fontSize: '12px', fontWeight: 300, cursor: 'pointer',
                }}
              >
                <Download style={{ width: '14px', height: '14px' }} />
                Exportar CSV
              </button>
            )}
            {isPro && selecionados.length > 0 && (
              <button
                onClick={() => setModalAberto(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#f5f3f0', color: '#0c0b0a',
                  padding: '8px 14px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer',
                }}
              >
                <CreditCard style={{ width: '14px', height: '14px' }} />
                Pagar selecionados via PIX
              </button>
            )}
          </div>
        </div>

        {pendentes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6560' }}>
            <CheckCircle style={{ width: '32px', height: '32px', margin: '0 auto 0.75rem', opacity: 0.2 }} />
            <p style={{ fontSize: '13px', fontWeight: 300 }}>Nenhum afiliado com saldo pendente. Tudo em dia!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {isPro && <th style={{ padding: '10px 24px', width: '40px' }}></th>}
                {['Afiliado', 'Email', 'Chave PIX', 'Valor a receber'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 400, color: '#4a4440',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendentes.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: isPro && !a.selecionado ? 0.5 : 1 }}>
                  {isPro && (
                    <td style={{ padding: '12px 24px' }}>
                      <input
                        type="checkbox"
                        checked={a.selecionado}
                        onChange={() => toggleAfiliado(a.id)}
                        style={{ width: '14px', height: '14px', accentColor: '#7c3aed', cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{a.nome}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{a.email}</td>
                  <td style={{ padding: '12px 24px', fontSize: '12px', fontFamily: 'monospace', color: '#6b6560', fontWeight: 300 }}>
                    {a.chave_pix || <span style={{ color: '#4a4440', fontSize: '11px' }}>Sem chave PIX</span>}
                  </td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(a.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>Histórico de pagamentos</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Data', 'Afiliados pagos', 'Total pago', 'Taxa BongiaTech (3%)', 'Status'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 400, color: '#4a4440',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontWeight: 300 }}>{formatDateTime(p.criado_em)}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{p.afiliados_pagos}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{formatCurrency(p.total_pago)}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{formatCurrency(p.taxa_plataforma)}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', fontSize: '11px', fontWeight: 400,
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: p.status === 'concluido' ? '#f5f3f0' : p.status === 'erro' ? '#f87171' : '#d97706',
                    }}>
                      {p.status === 'concluido' ? 'Concluído' : p.status === 'erro' ? 'Erro' : 'Processando'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmação */}
      {modalAberto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
        }}>
          <div style={{
            background: '#111010', border: '1px solid rgba(255,255,255,0.07)',
            width: '100%', maxWidth: '512px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <h2 style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0' }}>Confirme o pagamento de comissões</h2>
              <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>Revise cada afiliado antes de confirmar. O PIX só é enviado após sua aprovação.</p>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selecionados.map((a) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.03)', padding: '12px 16px',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{a.nome}</p>
                    <p style={{ fontSize: '11px', color: '#6b6560', fontFamily: 'monospace', marginTop: '2px', fontWeight: 300 }}>{a.chave_pix}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(a.saldo)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b6560', fontWeight: 300 }}>Afiliados selecionados:</span>
                  <span style={{ color: '#f5f3f0', fontWeight: 400 }}>{selecionados.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b6560', fontWeight: 300 }}>Subtotal de comissões:</span>
                  <span style={{ color: '#f5f3f0', fontWeight: 400 }}>{formatCurrency(totalSaldo)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b6560', fontWeight: 300 }}>Taxa BongiaTech (3%):</span>
                  <span style={{ color: '#d97706', fontWeight: 400 }}>{formatCurrency(taxaPlataforma)}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#f5f3f0', fontWeight: 500 }}>Total debitado da sua conta Asaas:</span>
                  <span style={{ color: '#7c3aed', fontWeight: 600 }}>{formatCurrency(totalSaldo)}</span>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>
                A taxa de 3% será cobrada na sua fatura mensal separadamente.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setModalAberto(false)}
                  disabled={pagando}
                  style={{
                    flex: 1, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#6b6560',
                    padding: '10px', fontSize: '13px', fontWeight: 300, cursor: 'pointer', opacity: pagando ? 0.5 : 1,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarPagamento}
                  disabled={pagando}
                  style={{
                    flex: 1, background: '#f5f3f0', color: '#0c0b0a',
                    padding: '10px', fontSize: '13px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', opacity: pagando ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  {pagando && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
                  {pagando ? 'Enviando PIX...' : `Confirmar e pagar ${selecionados.length} afiliados`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

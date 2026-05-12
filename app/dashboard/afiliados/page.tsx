'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { UserPlus, Copy, Check, Link } from 'lucide-react'
import type { Afiliado } from '@/types/afiliado'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/[﻿﻿]/g, '').trim()

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
  padding: '8px 12px', fontSize: '13px', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400,
}

export default function AfiliadosPage() {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'inativos' | 'saldo'>('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [copiadoAcesso, setCopiadoAcesso] = useState<string | null>(null)
  const [gerandoLink, setGerandoLink] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [form, setForm] = useState({ nome: '', email: '', chave_pix: '', tipo_pix: 'cpf', comissao: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [limiteAtingido, setLimiteAtingido] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/afiliados')
    const data = await res.json()
    setAfiliados(data)
    setCarregando(false)
  }

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const res = await fetch('/api/afiliados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        chave_pix: form.chave_pix || undefined,
        tipo_pix: form.tipo_pix || undefined,
        comissao: form.comissao ? parseFloat(form.comissao) : undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      if (data.upgrade) {
        setLimiteAtingido(true)
        setEnviando(false)
        return
      }
      setErro(data.erro || 'Erro ao adicionar afiliado')
      setEnviando(false)
      return
    }

    setAfiliados((prev) => [data, ...prev])
    setModalAberto(false)
    setLimiteAtingido(false)
    setForm({ nome: '', email: '', chave_pix: '', tipo_pix: 'cpf', comissao: '' })
    setEnviando(false)
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch(`/api/afiliados/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    setAfiliados((prev) => prev.map((a) => a.id === id ? { ...a, ativo: !ativo } : a))
  }

  function copiarLink(refCode: string) {
    const link = `${APP_URL}/loja?ref=${refCode}`
    navigator.clipboard.writeText(link)
    setCopiado(refCode)
    setTimeout(() => setCopiado(null), 2000)
  }

  async function copiarLinkAcesso(afiliadoId: string) {
    setGerandoLink(afiliadoId)
    try {
      const res = await fetch(`/api/afiliado/gerar-link?id=${afiliadoId}`)
      const data = await res.json()
      if (data.ok && data.link) {
        await navigator.clipboard.writeText(data.link)
        setCopiadoAcesso(afiliadoId)
        setTimeout(() => setCopiadoAcesso(null), 3000)
      }
    } finally {
      setGerandoLink(null)
    }
  }

  const filtrados = afiliados.filter((a) => {
    if (filtro === 'ativos') return a.ativo
    if (filtro === 'inativos') return !a.ativo
    if (filtro === 'saldo') return a.saldo > 0
    return true
  })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Afiliados</h1>
          <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>{afiliados.length} afiliados cadastrados</p>
        </div>
        <button
          onClick={() => { setLimiteAtingido(false); setErro(''); setModalAberto(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#f5f3f0', color: '#0c0b0a',
            padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
          }}
        >
          <UserPlus style={{ width: '14px', height: '14px' }} />
          Adicionar afiliado
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
        {(['todos', 'ativos', 'inativos', 'saldo'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '4px 12px', fontSize: '12px', fontWeight: 300, cursor: 'pointer',
              background: filtro === f ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.07)',
              color: filtro === f ? '#f5f3f0' : '#6b6560',
            }}
          >
            {f === 'todos' ? 'Todos' : f === 'ativos' ? 'Ativos' : f === 'inativos' ? 'Inativos' : 'Com saldo'}
          </button>
        ))}
      </div>

      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
        {carregando ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Nenhum afiliado encontrado.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Nome', 'Email', 'Vendas totais', 'Saldo a pagar', 'Cliques', 'Status', 'Link afiliado', 'Acesso painel', ''].map((h) => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 400, color: '#4a4440',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{a.nome}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{a.email}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{formatCurrency(a.total_vendas)}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(a.saldo)}</td>
                  <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{a.total_cliques}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', fontSize: '11px', fontWeight: 400,
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: a.ativo ? '#f5f3f0' : '#6b6560',
                    }}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 24px' }}>
                    <button
                      onClick={() => copiarLink(a.ref_code)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', color: '#6b6560', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 300,
                      }}
                    >
                      {copiado === a.ref_code ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                      {copiado === a.ref_code ? 'Copiado!' : 'Copiar link'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 24px' }}>
                    <button
                      onClick={() => copiarLinkAcesso(a.id)}
                      disabled={gerandoLink === a.id}
                      title="Gera link de acesso ao painel (válido 1h). Envie ao afiliado via WhatsApp."
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', color: copiadoAcesso === a.id ? '#f5f3f0' : '#6b6560',
                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 300,
                        opacity: gerandoLink === a.id ? 0.5 : 1,
                      }}
                    >
                      {copiadoAcesso === a.id ? <Check style={{ width: '12px', height: '12px' }} /> : <Link style={{ width: '12px', height: '12px' }} />}
                      {gerandoLink === a.id ? 'Gerando...' : copiadoAcesso === a.id ? 'Copiado!' : 'Link acesso'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 24px' }}>
                    <button
                      onClick={() => toggleAtivo(a.id, a.ativo)}
                      style={{ fontSize: '12px', color: '#4a4440', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 300 }}
                    >
                      {a.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal adicionar */}
      {modalAberto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
        }}>
          <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', width: '100%', maxWidth: '448px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0' }}>Adicionar afiliado</h2>
              <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>O afiliado receberá um email com o link dele.</p>
            </div>
            <form onSubmit={adicionar} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Comissão % (opcional)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.comissao}
                  onChange={(e) => setForm((f) => ({ ...f, comissao: e.target.value }))}
                  placeholder="Usa o padrão da loja se vazio"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Tipo PIX</label>
                  <select
                    value={form.tipo_pix}
                    onChange={(e) => setForm((f) => ({ ...f, tipo_pix: e.target.value }))}
                    style={{ ...inputStyle, color: '#f5f3f0' }}
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">Email</option>
                    <option value="telefone">Telefone</option>
                    <option value="chave_aleatoria">Chave aleatória</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Chave PIX</label>
                  <input
                    type="text"
                    value={form.chave_pix}
                    onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {limiteAtingido && (
                <div style={{
                  background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
                  padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <p style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 500, margin: 0 }}>
                    Limite do plano Grátis atingido
                  </p>
                  <p style={{ fontSize: '12px', color: '#a09890', fontWeight: 300, margin: 0 }}>
                    O plano Grátis permite até 3 afiliados. Faça upgrade para o Pro e tenha afiliados ilimitados.
                  </p>
                  <a
                    href="/dashboard/pagamentos"
                    style={{
                      display: 'inline-block', background: '#d97706', color: '#fff',
                      padding: '8px 16px', fontSize: '12px', fontWeight: 500,
                      textDecoration: 'none', textAlign: 'center',
                    }}
                  >
                    Ver planos → Pro por R$49/mês
                  </a>
                </div>
              )}

              {erro && !limiteAtingido && (
                <p style={{
                  fontSize: '13px', color: '#f87171',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  padding: '10px 12px',
                }}>{erro}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setModalAberto(false); setErro(''); setLimiteAtingido(false) }}
                  style={{
                    flex: 1, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#6b6560',
                    padding: '10px', fontSize: '13px', fontWeight: 300, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  style={{
                    flex: 1, background: '#f5f3f0', color: '#0c0b0a',
                    padding: '10px', fontSize: '13px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', opacity: enviando ? 0.6 : 1,
                  }}
                >
                  {enviando ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

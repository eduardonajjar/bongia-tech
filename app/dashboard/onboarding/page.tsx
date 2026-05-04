'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, ChevronRight, AlertTriangle, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const NUVEMSHOP_CLIENT_ID = process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || ''

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
  padding: '10px 12px', fontSize: '13px', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400,
}

export default function OnboardingPage() {
  const router = useRouter()
  const [passo, setPasso] = useState(1)
  const [afiliado, setAfiliado] = useState<{ nome: string; ref_code: string; token: string } | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [confete, setConfete] = useState(false)

  const [form, setForm] = useState({ nome: '', email: '', comissao: '10', chave_pix: '', tipo_pix: 'cpf' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function adicionarAfiliado(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const res = await fetch('/api/afiliados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        comissao: parseFloat(form.comissao),
        chave_pix: form.chave_pix || undefined,
        tipo_pix: form.tipo_pix || undefined,
      }),
    })

    const data = await res.json()
    setEnviando(false)

    if (!res.ok) {
      setErro(data.erro || 'Erro ao adicionar afiliado')
      return
    }

    setAfiliado(data)
    setPasso(2)
  }

  function copiarLink() {
    if (!afiliado) return
    navigator.clipboard.writeText(`${APP_URL}/loja?ref=${afiliado.ref_code}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function concluir() {
    // Marcar onboarding concluído
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('lojistas').update({ onboarding_concluido: true }).eq('id', user.id)
    }
    setConfete(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  const link = afiliado ? `${APP_URL}/loja?ref=${afiliado.ref_code}` : ''

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0b0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '544px' }}>
        {/* Confetes animados */}
        {confete && (
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>🎉</div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: '#f5f3f0' }}>Tudo pronto!</p>
              <p style={{ color: '#6b6560', marginTop: '8px', fontSize: '14px', fontWeight: 300 }}>
                Agora é só mandar o link para {afiliado?.nome} e esperar as vendas chegarem.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.5rem', color: '#f5f3f0', fontWeight: 400 }}>
            BongiaTech
          </h1>
          <p style={{ color: '#6b6560', marginTop: '4px', fontSize: '13px', fontWeight: 300 }}>Configure em 3 passos</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{
                width: '32px', height: '32px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 500, border: '1px solid',
                background: passo > n ? 'transparent' : passo === n ? '#f5f3f0' : 'transparent',
                borderColor: passo > n ? 'rgba(74,222,128,0.4)' : passo === n ? '#f5f3f0' : 'rgba(255,255,255,0.1)',
                color: passo > n ? '#4ade80' : passo === n ? '#0c0b0a' : '#6b6560',
              }}>
                {passo > n ? <Check style={{ width: '14px', height: '14px' }} /> : n}
              </div>
              {n < 3 && (
                <div style={{
                  flex: 1, height: '1px',
                  background: passo > n ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.07)',
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Passo 1 — Adicionar primeiro afiliado */}
          {passo === 1 && (
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)', marginBottom: '4px' }}>
                Adicione seu primeiro afiliado
              </h2>
              <p style={{ color: '#6b6560', fontSize: '13px', marginBottom: '1.5rem', fontWeight: 300 }}>
                O sistema vai gerar um link rastreável único para ele.
              </p>

              <form onSubmit={adicionarAfiliado} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Nome do afiliado</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      style={inputStyle}
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      style={inputStyle}
                      placeholder="joao@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Comissão (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.comissao}
                      onChange={(e) => setForm((f) => ({ ...f, comissao: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>
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
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Chave PIX (opcional agora)</label>
                    <input
                      type="text"
                      value={form.chave_pix}
                      onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
                      style={inputStyle}
                      placeholder="Pode adicionar depois"
                    />
                  </div>
                </div>

                {erro && (
                  <p style={{
                    fontSize: '13px', color: '#f87171',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    padding: '10px 12px',
                  }}>{erro}</p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  style={{
                    width: '100%', background: '#f5f3f0', color: '#0c0b0a',
                    padding: '12px', fontSize: '14px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', opacity: enviando ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  {enviando ? 'Adicionando...' : 'Adicionar e continuar'}
                  {!enviando && <ChevronRight style={{ width: '16px', height: '16px' }} />}
                </button>
              </form>
            </div>
          )}

          {/* Passo 2 — Link rastreável */}
          {passo === 2 && afiliado && (
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)', marginBottom: '4px' }}>
                Copie o link do {afiliado.nome}
              </h2>
              <p style={{ color: '#6b6560', fontSize: '13px', marginBottom: '1.5rem', fontWeight: 300 }}>
                Mande esse link para seu afiliado. Quando alguém clicar e comprar, a venda aparece automaticamente no seu painel.
              </p>

              <div style={{
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                padding: '1rem', marginBottom: '1.5rem',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 400, color: '#6b6560', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Link de afiliado gerado:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ flex: 1, fontSize: '12px', color: '#f5f3f0', wordBreak: 'break-all', fontFamily: 'monospace' }}>{link}</code>
                  <button
                    onClick={copiarLink}
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                      background: '#f5f3f0', color: '#0c0b0a',
                      fontSize: '12px', fontWeight: 500, padding: '6px 12px',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {copiado ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div style={{
                background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
                padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '10px',
              }}>
                <AlertTriangle style={{ width: '14px', height: '14px', color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#d97706', fontWeight: 300 }}>
                  Esse link <strong>não tem desconto visível</strong> — então não vaza para o Pelando ou Zoom. Só grava um cookie invisível quando alguém clica.
                </p>
              </div>

              <button
                onClick={() => setPasso(3)}
                style={{
                  width: '100%', background: '#f5f3f0', color: '#0c0b0a',
                  padding: '12px', fontSize: '14px', fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                Continuar <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}

          {/* Passo 3 — Conectar Nuvemshop */}
          {passo === 3 && (
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)', marginBottom: '4px' }}>
                Conecte sua loja Nuvemshop
              </h2>
              <p style={{ color: '#6b6560', fontSize: '13px', marginBottom: '1.5rem', fontWeight: 300 }}>
                Para as vendas aparecerem automaticamente, precisamos receber os pedidos da sua loja.
              </p>

              <div style={{
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '10px',
              }}>
                <AlertTriangle style={{ width: '14px', height: '14px', color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#f87171', fontWeight: 300 }}>
                  <strong>Sem conectar a loja,</strong> as vendas não são registradas automaticamente. Você pode fazer isso agora ou depois em Integrações.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href={`https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(`${APP_URL}/api/nuvemshop/callback`)}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', background: '#7c3aed', color: '#fff',
                    padding: '12px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 500,
                  }}
                >
                  <Link2 style={{ width: '16px', height: '16px' }} />
                  Conectar loja Nuvemshop agora
                </a>
                <button
                  onClick={concluir}
                  style={{
                    width: '100%', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#6b6560',
                    padding: '12px', fontSize: '13px', fontWeight: 300, cursor: 'pointer',
                  }}
                >
                  Pular por agora — vou conectar depois
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

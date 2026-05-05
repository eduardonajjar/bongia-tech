'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, ExternalLink, Loader2, Link2 } from 'lucide-react'

const NUVEMSHOP_CLIENT_ID = (process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || '').replace(/[﻿]/g, '').trim()
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/[﻿]/g, '').trim()

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
  padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'monospace',
}

export default function IntegracaoPage() {
  const [nuvemshopConectado, setNuvemshopConectado] = useState(false)
  const [asaasKey, setAsaasKey] = useState('')
  const [asaasConectado, setAsaasConectado] = useState(false)
  const [asaasSaldo, setAsaasSaldo] = useState<number | null>(null)
  const [asaasNome, setAsaasNome] = useState('')
  const [testando, setTestando] = useState(false)
  const [erroAsaas, setErroAsaas] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('lojistas')
        .select('nuvemshop_store_id, asaas_api_key')
        .eq('id', user.id)
        .single()

      setNuvemshopConectado(!!data?.nuvemshop_store_id)
      setAsaasConectado(!!data?.asaas_api_key)
      setCarregando(false)
    }

    // Verificar params da URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('ok') === 'nuvemshop') {
      setNuvemshopConectado(true)
    }

    carregar()
  }, [])

  async function testarAsaas(e: React.FormEvent) {
    e.preventDefault()
    setErroAsaas('')
    setTestando(true)

    const res = await fetch('/api/asaas/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: asaasKey }),
    })

    const data = await res.json()
    setTestando(false)

    if (res.ok) {
      setAsaasConectado(true)
      setAsaasSaldo(data.saldo)
      setAsaasNome(data.nome)
      setAsaasKey('')
    } else {
      setErroAsaas(data.erro || 'Erro ao verificar API key')
    }
  }

  async function desconectarNuvemshop() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('lojistas')
      .update({ nuvemshop_token: null, nuvemshop_store_id: null })
      .eq('id', user.id)

    setNuvemshopConectado(false)
  }

  if (carregando) return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando...</div>

  const nuvemshopOAuthUrl = `https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(`${APP_URL}/api/nuvemshop/callback`)}`

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Integrações</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>Conecte sua loja e configure o método de pagamento</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Nuvemshop */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0' }}>Nuvemshop</h2>
              <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>
                Conecte sua loja para rastrear vendas automaticamente
              </p>
            </div>
            {nuvemshopConectado && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 400, color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.2)', padding: '3px 8px',
              }}>
                <CheckCircle style={{ width: '12px', height: '12px' }} />
                Conectado
              </span>
            )}
          </div>

          {nuvemshopConectado ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>
                Sua loja está conectada. Vendas realizadas via links de afiliados serão rastreadas automaticamente.
              </p>
              <button
                onClick={desconectarNuvemshop}
                style={{ background: 'none', border: 'none', fontSize: '13px', color: '#f87171', textDecoration: 'underline', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 300 }}
              >
                Desconectar loja
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>
                Autorize o BongiaTech a ler os pedidos da sua loja para atribuir vendas aos afiliados.
              </p>
              <a
                href={nuvemshopOAuthUrl}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#7c3aed', color: '#fff',
                  padding: '8px 16px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 500,
                }}
              >
                <Link2 style={{ width: '14px', height: '14px' }} />
                Conectar loja Nuvemshop
                <ExternalLink style={{ width: '12px', height: '12px', opacity: 0.7 }} />
              </a>
            </div>
          )}
        </div>

        {/* Asaas */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0' }}>Asaas</h2>
              <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>
                Para pagar afiliados via PIX em massa
              </p>
            </div>
            {asaasConectado && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 400, color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.2)', padding: '3px 8px',
              }}>
                <CheckCircle style={{ width: '12px', height: '12px' }} />
                Conectado
              </span>
            )}
          </div>

          {asaasConectado ? (
            <div style={{
              background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
              padding: '1rem',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 400, color: '#4ade80' }}>API Asaas configurada com sucesso!</p>
              {asaasNome && <p style={{ fontSize: '13px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>Conta: {asaasNome}</p>}
              {asaasSaldo !== null && (
                <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>
                  Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asaasSaldo)}
                </p>
              )}
              <button
                onClick={() => setAsaasConectado(false)}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: '#6b6560', textDecoration: 'underline', cursor: 'pointer', marginTop: '8px', padding: 0, fontWeight: 300 }}
              >
                Atualizar API key
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                padding: '12px',
              }}>
                <p style={{ fontSize: '12px', color: '#f5f3f0', fontWeight: 400, marginBottom: '6px' }}>Como obter sua API key:</p>
                <ol style={{ fontSize: '12px', color: '#6b6560', marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 300 }}>
                  <li>Crie sua conta gratuita em asaas.com</li>
                  <li>Acesse Configurações → API e Integrações</li>
                  <li>Copie sua API key de produção</li>
                </ol>
              </div>

              <form onSubmit={testarAsaas} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400 }}>
                    API Key do Asaas
                  </label>
                  <input
                    type="password"
                    value={asaasKey}
                    onChange={(e) => setAsaasKey(e.target.value)}
                    placeholder="$aact_..."
                    style={inputStyle}
                    required
                  />
                  <p style={{ fontSize: '11px', color: '#4a4440', marginTop: '4px', fontWeight: 300 }}>
                    Armazenada criptografada (AES-256). Nunca compartilhamos sua chave.
                  </p>
                </div>

                {erroAsaas && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    padding: '10px 12px',
                  }}>
                    <AlertCircle style={{ width: '14px', height: '14px', color: '#f87171', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: '#f87171', fontWeight: 300 }}>{erroAsaas}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={testando}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#7c3aed', color: '#fff',
                    padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', opacity: testando ? 0.6 : 1,
                  }}
                >
                  {testando && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
                  {testando ? 'Verificando...' : 'Testar e salvar conexão'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

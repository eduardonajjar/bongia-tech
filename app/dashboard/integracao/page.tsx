'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, ExternalLink, Loader2, Link2 } from 'lucide-react'

const NUVEMSHOP_CLIENT_ID = (process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || '').replace(/[﻿]/g, '').trim()
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/[﻿]/g, '').trim()

const s = {
  label: { display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400 } as React.CSSProperties,
  input: {
    width: '100%', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
    padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'monospace',
  } as React.CSSProperties,
}

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: done ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
      border: done ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.1)',
      fontSize: '12px', fontWeight: 500,
      color: done ? '#4ade80' : '#6b6560',
    }}>
      {done ? '✓' : n}
    </div>
  )
}

export default function IntegracaoPage() {
  const [nuvemshopConectado, setNuvemshopConectado] = useState(false)
  const [nomeAfiliados, setNomeAfiliados] = useState(0)
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

      const { count } = await supabase
        .from('afiliados')
        .select('id', { count: 'exact', head: true })
        .eq('lojista_id', user.id)

      setNuvemshopConectado(!!data?.nuvemshop_store_id)
      setAsaasConectado(!!data?.asaas_api_key)
      setNomeAfiliados(count || 0)
      setCarregando(false)
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('ok') === 'nuvemshop') setNuvemshopConectado(true)

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
    await supabase.from('lojistas').update({ nuvemshop_token: null, nuvemshop_store_id: null } as any).eq('id', user.id)
    setNuvemshopConectado(false)
  }

  if (carregando) return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px' }}>Carregando...</div>

  const nuvemshopOAuthUrl = `https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(`${APP_URL}/api/nuvemshop/callback`)}`

  const progressoTotal = [nuvemshopConectado, nomeAfiliados > 0].filter(Boolean).length
  const totalSteps = 2

  return (
    <div style={{ padding: '2rem', maxWidth: '680px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Configuração</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>
          Siga os passos abaixo para ativar seu programa de afiliados
        </p>
      </div>

      {/* Barra de progresso */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b6560', fontWeight: 300 }}>
            {progressoTotal === totalSteps ? '✓ Tudo configurado!' : `${progressoTotal} de ${totalSteps} etapas concluídas`}
          </span>
          <span style={{ fontSize: '12px', color: '#6b6560', fontWeight: 300 }}>{Math.round((progressoTotal / totalSteps) * 100)}%</span>
        </div>
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '1px' }}>
          <div style={{
            height: '100%', background: '#4ade80', borderRadius: '1px',
            width: `${(progressoTotal / totalSteps) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.07)' }}>

        {/* PASSO 1 — Nuvemshop */}
        <div style={{ background: '#111010', padding: '1.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <StepBadge n={1} done={nuvemshopConectado} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#f5f3f0' }}>
                  Conectar sua loja Nuvemshop
                </h2>
                {nuvemshopConectado && (
                  <span style={{ fontSize: '11px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} /> Conectada
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Autorize o Bongia a ler os pedidos da sua loja. É esse acesso que permite rastrear automaticamente cada venda gerada pelos seus afiliados.
              </p>

              {nuvemshopConectado ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#4ade80', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 300 }}>
                      Loja conectada. Vendas dos afiliados serão rastreadas automaticamente.
                    </p>
                  </div>
                  <button
                    onClick={desconectarNuvemshop}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: '#6b6560', textDecoration: 'underline', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 300 }}
                  >
                    Desconectar loja
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Como fazer */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' }}>
                    <p style={{ fontSize: '12px', color: '#f5f3f0', fontWeight: 400, marginBottom: '12px' }}>
                      Como funciona a instalação:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { n: '1', text: 'Clique em "Conectar loja" abaixo' },
                        { n: '2', text: 'Você será redirecionado para a Nuvemshop' },
                        { n: '3', text: 'Clique em "Autorizar" na tela da Nuvemshop' },
                        { n: '4', text: 'Pronto — você volta automaticamente para o painel' },
                      ].map(item => (
                        <div key={item.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', color: '#6b6560', fontWeight: 400,
                          }}>
                            {item.n}
                          </div>
                          <span style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300, lineHeight: 1.5 }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={nuvemshopOAuthUrl}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: '#7c3aed', color: '#fff',
                      padding: '10px 20px', textDecoration: 'none',
                      fontSize: '13px', fontWeight: 500, alignSelf: 'flex-start',
                    }}
                  >
                    <Link2 style={{ width: '14px', height: '14px' }} />
                    Conectar loja Nuvemshop
                    <ExternalLink style={{ width: '12px', height: '12px', opacity: 0.7 }} />
                  </a>
                  <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>
                    Você precisará estar logado na Nuvemshop. A autorização leva menos de 1 minuto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PASSO 2 — Cadastrar afiliados */}
        <div style={{ background: '#111010', padding: '1.75rem', opacity: nuvemshopConectado ? 1 : 0.5 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <StepBadge n={2} done={nomeAfiliados > 0} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#f5f3f0' }}>
                  Cadastrar seu primeiro afiliado
                </h2>
                {nomeAfiliados > 0 && (
                  <span style={{ fontSize: '11px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} /> {nomeAfiliados} afiliado{nomeAfiliados > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Adicione um influenciador, parceiro ou cliente que vai divulgar sua loja. Cada afiliado recebe um link exclusivo de rastreamento.
              </p>

              {nomeAfiliados > 0 ? (
                <div style={{
                  background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <CheckCircle style={{ width: '16px', height: '16px', color: '#4ade80', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 300 }}>
                    Você já tem {nomeAfiliados} afiliado{nomeAfiliados > 1 ? 's' : ''} cadastrado{nomeAfiliados > 1 ? 's' : ''}.
                  </p>
                </div>
              ) : (
                <a href="/dashboard/afiliados" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.07)', color: '#f5f3f0',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '9px 18px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 400,
                  pointerEvents: nuvemshopConectado ? 'auto' : 'none',
                }}>
                  Ir para Afiliados →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Separador — opcional */}
        <div style={{ background: '#111010', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            Opcional — para pagamento automático
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Asaas */}
        <div style={{ background: '#111010', padding: '1.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: asaasConectado ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
              border: asaasConectado ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.07)',
              fontSize: '12px', color: asaasConectado ? '#4ade80' : '#4a4440',
            }}>
              {asaasConectado ? '✓' : '◎'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#f5f3f0' }}>
                  Asaas — PIX automático para afiliados
                </h2>
                {asaasConectado && (
                  <span style={{ fontSize: '11px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} /> Conectado
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Com o Asaas conectado, você pode pagar todos os afiliados via PIX em 1 clique diretamente pelo painel.
                Sem isso, o pagamento é manual (você exporta o CSV e paga pelo seu banco).
              </p>

              {asaasConectado ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
                    padding: '12px 16px',
                  }}>
                    <p style={{ fontSize: '13px', color: '#4ade80' }}>Asaas conectado!</p>
                    {asaasNome && <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>Conta: {asaasNome}</p>}
                    {asaasSaldo !== null && (
                      <p style={{ fontSize: '12px', color: '#6b6560', fontWeight: 300 }}>
                        Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asaasSaldo)}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setAsaasConectado(false)}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: '#6b6560', textDecoration: 'underline', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 300 }}>
                    Atualizar API key
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' }}>
                    <p style={{ fontSize: '12px', color: '#f5f3f0', fontWeight: 400, marginBottom: '10px' }}>Como obter sua chave Asaas:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { n: '1', text: 'Crie sua conta gratuita em asaas.com' },
                        { n: '2', text: 'Acesse Configurações → API e Integrações' },
                        { n: '3', text: 'Copie a API key de produção (começa com $aact_)' },
                        { n: '4', text: 'Cole abaixo e clique em "Testar e salvar"' },
                      ].map(item => (
                        <div key={item.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', color: '#6b6560',
                          }}>{item.n}</div>
                          <span style={{ fontSize: '12px', color: '#6b6560', fontWeight: 300, lineHeight: 1.5 }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <a href="https://asaas.com" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#7c3aed', textDecoration: 'none', marginTop: '12px' }}>
                      Abrir asaas.com <ExternalLink style={{ width: '10px', height: '10px' }} />
                    </a>
                  </div>

                  <form onSubmit={testarAsaas} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={s.label}>API Key do Asaas</label>
                      <input type="password" value={asaasKey} onChange={e => setAsaasKey(e.target.value)}
                        placeholder="$aact_..." style={s.input} required />
                      <p style={{ fontSize: '11px', color: '#4a4440', marginTop: '4px', fontWeight: 300 }}>
                        Armazenada com segurança. Nunca compartilhamos sua chave.
                      </p>
                    </div>
                    {erroAsaas && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 12px',
                      }}>
                        <AlertCircle style={{ width: '14px', height: '14px', color: '#f87171', flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', color: '#f87171', fontWeight: 300 }}>{erroAsaas}</p>
                      </div>
                    )}
                    <button type="submit" disabled={testando} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: '#7c3aed', color: '#fff',
                      padding: '9px 18px', fontSize: '13px', fontWeight: 500,
                      border: 'none', cursor: 'pointer', opacity: testando ? 0.6 : 1, alignSelf: 'flex-start',
                    }}>
                      {testando && <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
                      {testando ? 'Verificando...' : 'Testar e salvar conexão'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

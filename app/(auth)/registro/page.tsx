'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink } from 'lucide-react'

const NUVEMSHOP_CLIENT_ID = (process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || '').replace(/[﻿]/g, '').trim()
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/[﻿]/g, '').trim()

function nuvemshopOAuthUrl() {
  const redirect = `${APP_URL}/api/nuvemshop/callback`
  return `https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(redirect)}`
}

export default function RegistroPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [modoEmail, setModoEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setCarregando(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    })

    if (error) {
      setErro(error.message === 'User already registered'
        ? 'Este email já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setCarregando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0b0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '384px' }}>
        <div style={{
          background: '#111010',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '2.5rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.5rem', color: '#f5f3f0', fontWeight: 400 }}>
              BongiaTech
            </h1>
            <p style={{ color: '#6b6560', marginTop: '4px', fontSize: '13px', fontWeight: 300 }}>30 dias grátis — sem cartão</p>
          </div>

          {!modoEmail ? (
            <>
              {/* CTA principal: instalar via Nuvemshop */}
              {NUVEMSHOP_CLIENT_ID && (
                <>
                  <a
                    href={nuvemshopOAuthUrl()}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      width: '100%', backgroundColor: '#00a0e3', color: '#fff',
                      padding: '11px', textDecoration: 'none',
                      fontSize: '14px', fontWeight: 500, marginBottom: '0.75rem',
                    }}
                  >
                    <ExternalLink style={{ width: '16px', height: '16px' }} />
                    Instalar via Nuvemshop
                  </a>
                  <p style={{ fontSize: '12px', color: '#4a4440', textAlign: 'center', marginBottom: '1rem', fontWeight: 300 }}>
                    Autorize o app e você já cai direto no painel — sem nova senha.
                  </p>
                </>
              )}

              <div style={{ position: 'relative', margin: '1rem 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span style={{ background: '#111010', padding: '0 12px', fontSize: '12px', color: '#6b6560' }}>ou cadastre com email</span>
                </div>
              </div>

              <button
                onClick={() => setModoEmail(true)}
                style={{
                  width: '100%', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#6b6560',
                  padding: '10px', fontSize: '13px', fontWeight: 300, cursor: 'pointer',
                }}
              >
                Criar conta com email e senha
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400 }}>Nome da loja ou empresa</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    style={{
                      width: '100%', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
                      padding: '10px 12px', fontSize: '13px', outline: 'none',
                    }}
                    placeholder="Minha Loja"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400 }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
                      padding: '10px 12px', fontSize: '13px', outline: 'none',
                    }}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b6560', marginBottom: '6px', fontWeight: 400 }}>Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={{
                      width: '100%', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
                      padding: '10px 12px', fontSize: '13px', outline: 'none',
                    }}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                {erro && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171', padding: '10px 12px', fontSize: '13px',
                  }}>
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  style={{
                    width: '100%', background: '#f5f3f0', color: '#0c0b0a',
                    padding: '11px', fontSize: '14px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', opacity: carregando ? 0.6 : 1,
                  }}
                >
                  {carregando ? 'Criando conta...' : 'Criar conta grátis'}
                </button>
              </form>

              <button
                onClick={() => setModoEmail(false)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  fontSize: '12px', color: '#4a4440', marginTop: '0.75rem', cursor: 'pointer', fontWeight: 300,
                }}
              >
                ← Voltar
              </button>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b6560', marginTop: '1.5rem', fontWeight: 300 }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: '#f5f3f0', textDecoration: 'underline' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

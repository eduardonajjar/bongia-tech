'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink } from 'lucide-react'

const NUVEMSHOP_CLIENT_ID = process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

function nuvemshopOAuthUrl() {
  const redirect = `${APP_URL}/api/nuvemshop/callback`
  return `https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(redirect)}`
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [modoEmail, setModoEmail] = useState(false)

  // Lê erro vindo do callback OAuth
  const erroParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('erro')
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('Email ou senha incorretos.')
      setCarregando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Bongia<span className="text-violet-600">Tech</span>
            </h1>
            <p className="text-gray-500 mt-1">Acesse seu painel</p>
          </div>

          {/* Erro do OAuth */}
          {erroParam === 'nuvemshop' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
              Erro ao conectar com a Nuvemshop. Tente novamente ou use email e senha.
            </div>
          )}

          {!modoEmail ? (
            <>
              {/* CTA principal: Nuvemshop */}
              {NUVEMSHOP_CLIENT_ID && (
                <a
                  href={nuvemshopOAuthUrl()}
                  className="flex items-center justify-center gap-2 w-full bg-[#15c] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity mb-4"
                  style={{ backgroundColor: '#00a0e3' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Entrar com Nuvemshop
                </a>
              )}

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400">
                  <span className="bg-white px-3">ou</span>
                </div>
              </div>

              <button
                onClick={() => setModoEmail(true)}
                className="w-full border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Entrar com email e senha
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-violet-600 text-white rounded-lg py-2.5 font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {carregando ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <button
                onClick={() => setModoEmail(false)}
                className="w-full text-xs text-gray-400 mt-3 hover:text-gray-600 transition-colors"
              >
                ← Voltar
              </button>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link href="/registro" className="text-violet-600 hover:underline font-medium">
              Começar grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

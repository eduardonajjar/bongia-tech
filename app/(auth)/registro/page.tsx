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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Bongia<span className="text-violet-600">Tech</span>
            </h1>
            <p className="text-gray-500 mt-1">14 dias grátis — sem cartão</p>
          </div>

          {!modoEmail ? (
            <>
              {/* CTA principal: instalar via Nuvemshop */}
              {NUVEMSHOP_CLIENT_ID && (
                <>
                  <a
                    href={nuvemshopOAuthUrl()}
                    className="flex items-center justify-center gap-2 w-full text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity mb-3"
                    style={{ backgroundColor: '#00a0e3' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Instalar via Nuvemshop
                  </a>
                  <p className="text-xs text-gray-400 text-center mb-4">
                    Autorize o app e você já cai direto no painel — sem nova senha.
                  </p>
                </>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400">
                  <span className="bg-white px-3">ou cadastre com email</span>
                </div>
              </div>

              <button
                onClick={() => setModoEmail(true)}
                className="w-full border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Criar conta com email e senha
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da loja ou empresa</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Minha Loja"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Mínimo 8 caracteres"
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
                  {carregando ? 'Criando conta...' : 'Criar conta grátis'}
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
            Já tem conta?{' '}
            <Link href="/login" className="text-violet-600 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

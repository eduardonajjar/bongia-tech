'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, ExternalLink, Loader2, Link2 } from 'lucide-react'

const NUVEMSHOP_CLIENT_ID = process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

  if (carregando) return <div className="p-8 text-gray-400">Carregando...</div>

  const nuvemshopOAuthUrl = `https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(`${APP_URL}/api/nuvemshop/callback`)}`

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-500 text-sm mt-1">Conecte sua loja e configure o método de pagamento</p>
      </div>

      <div className="space-y-6">
        {/* Nuvemshop */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Nuvemshop</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Conecte sua loja para rastrear vendas automaticamente
              </p>
            </div>
            {nuvemshopConectado && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                Conectado
              </span>
            )}
          </div>

          {nuvemshopConectado ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Sua loja está conectada. Vendas realizadas via links de afiliados serão rastreadas automaticamente.
              </p>
              <button
                onClick={desconectarNuvemshop}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Desconectar loja
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Autorize o BongiaTech a ler os pedidos da sua loja para atribuir vendas aos afiliados.
              </p>
              <a
                href={nuvemshopOAuthUrl}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
              >
                <Link2 className="w-4 h-4" />
                Conectar loja Nuvemshop
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          )}
        </div>

        {/* Asaas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Asaas</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Para pagar afiliados via PIX em massa
              </p>
            </div>
            {asaasConectado && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                Conectado
              </span>
            )}
          </div>

          {asaasConectado ? (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">API Asaas configurada com sucesso!</p>
              {asaasNome && <p className="text-sm text-green-700 mt-1">Conta: {asaasNome}</p>}
              {asaasSaldo !== null && (
                <p className="text-sm text-green-700">
                  Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asaasSaldo)}
                </p>
              )}
              <button
                onClick={() => setAsaasConectado(false)}
                className="text-xs text-green-600 underline mt-2"
              >
                Atualizar API key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">Como obter sua API key:</p>
                <ol className="text-sm text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                  <li>Crie sua conta gratuita em asaas.com</li>
                  <li>Acesse Configurações → API e Integrações</li>
                  <li>Copie sua API key de produção</li>
                </ol>
              </div>

              <form onSubmit={testarAsaas} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key do Asaas
                  </label>
                  <input
                    type="password"
                    value={asaasKey}
                    onChange={(e) => setAsaasKey(e.target.value)}
                    placeholder="$aact_..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Armazenada criptografada (AES-256). Nunca compartilhamos sua chave.
                  </p>
                </div>

                {erroAsaas && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700">{erroAsaas}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={testando}
                  className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {testando && <Loader2 className="w-4 h-4 animate-spin" />}
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

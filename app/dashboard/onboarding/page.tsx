'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, ChevronRight, AlertTriangle, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const NUVEMSHOP_CLIENT_ID = process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID || ''

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Confetes animados */}
        {confete && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">🎉</div>
              <p className="text-2xl font-bold text-violet-700">Tudo pronto!</p>
              <p className="text-gray-600 mt-2">Agora é só mandar o link para {afiliado?.nome} e esperar as vendas chegarem.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bongia<span className="text-violet-600">Tech</span>
          </h1>
          <p className="text-gray-500 mt-1">Configure em 3 passos</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                passo > n ? 'bg-green-500 text-white' :
                passo === n ? 'bg-violet-600 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {passo > n ? <Check className="w-4 h-4" /> : n}
              </div>
              {n < 3 && <div className={`flex-1 h-1 rounded ${passo > n ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Passo 1 — Adicionar primeiro afiliado */}
          {passo === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Adicione seu primeiro afiliado</h2>
              <p className="text-gray-500 text-sm mb-6">O sistema vai gerar um link rastreável único para ele.</p>

              <form onSubmit={adicionarAfiliado} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do afiliado</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="joao@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.comissao}
                      onChange={(e) => setForm((f) => ({ ...f, comissao: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo PIX</label>
                    <select
                      value={form.tipo_pix}
                      onChange={(e) => setForm((f) => ({ ...f, tipo_pix: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="cpf">CPF</option>
                      <option value="email">Email</option>
                      <option value="telefone">Telefone</option>
                      <option value="chave_aleatoria">Chave aleatória</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX (opcional agora)</label>
                    <input
                      type="text"
                      value={form.chave_pix}
                      onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Pode adicionar depois"
                    />
                  </div>
                </div>

                {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{erro}</p>}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enviando ? 'Adicionando...' : 'Adicionar e continuar'}
                  {!enviando && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {/* Passo 2 — Link rastreável */}
          {passo === 2 && afiliado && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Copie o link do {afiliado.nome}</h2>
              <p className="text-gray-500 text-sm mb-6">
                Mande esse link para seu afiliado. Quando alguém clicar e comprar, a venda aparece automaticamente no seu painel.
              </p>

              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
                <p className="text-xs font-medium text-violet-700 mb-2">Link de afiliado gerado:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-violet-900 break-all">{link}</code>
                  <button
                    onClick={copiarLink}
                    className="shrink-0 flex items-center gap-1.5 bg-violet-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Esse link <strong>não tem desconto visível</strong> — então não vaza para o Pelando ou Zoom. Só grava um cookie invisível quando alguém clica.
                </p>
              </div>

              <button
                onClick={() => setPasso(3)}
                className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Passo 3 — Conectar Nuvemshop */}
          {passo === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Conecte sua loja Nuvemshop</h2>
              <p className="text-gray-500 text-sm mb-6">
                Para as vendas aparecerem automaticamente, precisamos receber os pedidos da sua loja.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  <strong>Sem conectar a loja,</strong> as vendas não são registradas automaticamente. Você pode fazer isso agora ou depois em Integrações.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://www.nuvemshop.com.br/apps/${NUVEMSHOP_CLIENT_ID}/authorize?redirect_uri=${encodeURIComponent(`${APP_URL}/api/nuvemshop/callback`)}`}
                  className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Conectar loja Nuvemshop agora
                </a>
                <button
                  onClick={concluir}
                  className="w-full border border-gray-300 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors text-sm"
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

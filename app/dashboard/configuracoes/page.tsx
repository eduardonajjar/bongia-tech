'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle } from 'lucide-react'

interface Config {
  comissao_padrao: number
  janela_atribuicao_dias: number
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Config>({ comissao_padrao: 10, janela_atribuicao_dias: 30 })
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('lojistas')
        .select('comissao_padrao, janela_atribuicao_dias, plano, trial_ate')
        .eq('id', user.id)
        .single()

      if (data) {
        setConfig({
          comissao_padrao: data.comissao_padrao,
          janela_atribuicao_dias: data.janela_atribuicao_dias,
        })
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('lojistas')
      .update(config)
      .eq('id', user.id)

    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  if (carregando) return <div className="p-8 text-gray-400">Carregando...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Regras do seu programa de afiliados</p>
      </div>

      <form onSubmit={salvar} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comissão padrão (%)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Aplicada a afiliados sem comissão personalizada
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={config.comissao_padrao}
                onChange={(e) => setConfig((c) => ({ ...c, comissao_padrao: parseFloat(e.target.value) }))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-gray-500 text-sm">% por venda</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Janela de atribuição (dias)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Quantos dias após o clique a venda ainda é creditada ao afiliado
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={config.janela_atribuicao_dias}
                onChange={(e) => setConfig((c) => ({ ...c, janela_atribuicao_dias: parseInt(e.target.value) }))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-gray-500 text-sm">dias (padrão: 30)</span>
            </div>
          </div>
        </div>

        {/* Plano */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Plano atual</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'starter', label: 'Starter', preco: 'R$149/mês', limite: 'Até 50 afiliados' },
              { id: 'pro', label: 'Pro', preco: 'R$349/mês', limite: 'Afiliados ilimitados' },
            ].map((plano) => (
              <div
                key={plano.id}
                className="border-2 border-violet-500 rounded-xl p-4 bg-violet-50"
              >
                <p className="font-semibold text-violet-900">{plano.label}</p>
                <p className="text-2xl font-bold text-violet-700 mt-1">{plano.preco}</p>
                <p className="text-sm text-violet-600 mt-1">{plano.limite}</p>
                <p className="text-xs text-violet-500 mt-2">+ 3% sobre comissões pagas</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Para alterar seu plano, entre em contato: suporte@bongiatech.com.br
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Salvar configurações'}
          </button>
          {salvo && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Salvo com sucesso!
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

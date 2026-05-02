'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CreditCard, AlertCircle, CheckCircle, Loader2, Download, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AfiliadoPendente {
  id: string
  nome: string
  email: string
  saldo: number
  chave_pix: string | null
  total_vendas_count?: number
  selecionado: boolean
}

interface Pagamento {
  id: string
  total_pago: number
  taxa_plataforma: number
  afiliados_pagos: number
  status: string
  criado_em: string
}

interface Lojista {
  plano: string
  pagamento_automatico_ativo: boolean
  asaas_api_key: string | null
}

const TAXA = 0.03

export default function PagamentosPage() {
  const [pendentes, setPendentes] = useState<AfiliadoPendente[]>([])
  const [historico, setHistorico] = useState<Pagamento[]>([])
  const [lojista, setLojista] = useState<Lojista | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [resAfiliados, resPagamentos, resLojista] = await Promise.all([
      fetch('/api/afiliados'),
      fetch('/api/pagamentos'),
      supabase
        .from('lojistas')
        .select('plano, pagamento_automatico_ativo, asaas_api_key')
        .eq('id', user.id)
        .single(),
    ])

    const afiliados = await resAfiliados.json()
    const pags = await resPagamentos.json()

    setPendentes(
      afiliados
        .filter((a: AfiliadoPendente) => a.saldo > 0)
        .map((a: AfiliadoPendente) => ({ ...a, selecionado: true }))
    )
    setHistorico(pags)
    setLojista(resLojista.data)
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const selecionados = pendentes.filter((a) => a.selecionado)
  const totalSaldo = selecionados.reduce((s, a) => s + a.saldo, 0)
  const taxaPlataforma = totalSaldo * TAXA
  const isPro = lojista?.pagamento_automatico_ativo === true

  function toggleAfiliado(id: string) {
    setPendentes((prev) =>
      prev.map((a) => a.id === id ? { ...a, selecionado: !a.selecionado } : a)
    )
  }

  function exportarCSV() {
    const header = 'Nome,Email,Chave PIX,Valor a Receber (R$)'
    const rows = pendentes.map((a) =>
      `"${a.nome}","${a.email}","${a.chave_pix || 'Sem chave PIX'}","${a.saldo.toFixed(2)}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `afiliados-pagamento-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function confirmarPagamento() {
    setPagando(true)
    const ids = selecionados.map((a) => a.id)

    const res = await fetch('/api/pagamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afiliado_ids: ids }),
    })
    const data = await res.json()
    setPagando(false)
    setModalAberto(false)

    if (res.ok) {
      setResultado({
        ok: true,
        msg: `PIX enviado para ${data.afiliados_pagos} afiliados! Total: ${formatCurrency(data.total_pago)}`,
      })
      carregar()
    } else {
      setResultado({ ok: false, msg: data.erro || 'Erro ao processar pagamento' })
    }
    setTimeout(() => setResultado(null), 6000)
  }

  if (carregando) return <div className="p-8 text-gray-400">Carregando...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isPro ? 'Pague todos os afiliados de uma vez via PIX' : 'Veja quanto deve para cada afiliado e pague manualmente'}
        </p>
      </div>

      {resultado && (
        <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 border ${resultado.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {resultado.ok
            ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <p className={`text-sm font-medium ${resultado.ok ? 'text-green-800' : 'text-red-800'}`}>
            {resultado.msg}
          </p>
        </div>
      )}

      {/* Banner upgrade para Starter */}
      {!isPro && (
        <div className="mb-6 flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-violet-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-900">Quer pagar todos em 1 clique?</p>
              <p className="text-xs text-violet-600 mt-0.5">Faça upgrade para o plano Pro e pague via PIX automático.</p>
            </div>
          </div>
          <a
            href="/dashboard/configuracoes"
            className="shrink-0 bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Ver plano Pro
          </a>
        </div>
      )}

      {/* Seção a pagar */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              {isPro ? 'A pagar agora' : 'Pague seus afiliados manualmente'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {pendentes.length} afiliados · Total: {formatCurrency(pendentes.reduce((s, a) => s + a.saldo, 0))}
            </p>
          </div>
          <div className="flex gap-2">
            {pendentes.length > 0 && (
              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            )}
            {isPro && selecionados.length > 0 && (
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-semibold"
              >
                <CreditCard className="w-4 h-4" />
                Pagar selecionados via PIX
              </button>
            )}
          </div>
        </div>

        {pendentes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum afiliado com saldo pendente. Tudo em dia!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {isPro && <th className="px-6 py-3 w-10"></th>}
                {['Afiliado', 'Email', 'Chave PIX', 'Valor a receber'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendentes.map((a) => (
                <tr key={a.id} className={`hover:bg-gray-50 ${isPro && !a.selecionado ? 'opacity-50' : ''}`}>
                  {isPro && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={a.selecionado}
                        onChange={() => toggleAfiliado(a.id)}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{a.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.email}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {a.chave_pix || <span className="text-red-400 text-xs not-italic">Sem chave PIX</span>}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-700">{formatCurrency(a.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Histórico de pagamentos</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Data', 'Afiliados pagos', 'Total pago', 'Taxa BongiaTech (3%)', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historico.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(p.criado_em)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.afiliados_pagos}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(p.total_pago)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatCurrency(p.taxa_plataforma)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      p.status === 'erro' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status === 'concluido' ? 'Concluído' : p.status === 'erro' ? 'Erro' : 'Processando'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmação detalhado (Ajuste 2) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <h2 className="font-semibold text-gray-900 text-lg">Confirme o pagamento de comissões</h2>
              <p className="text-sm text-gray-500 mt-1">Revise cada afiliado antes de confirmar. O PIX só é enviado após sua aprovação.</p>
            </div>

            {/* Lista detalhada de afiliados */}
            <div className="overflow-y-auto flex-1 p-6 space-y-2">
              {selecionados.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.nome}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{a.chave_pix}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-green-700">{formatCurrency(a.saldo)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="p-6 border-t border-gray-100 shrink-0 space-y-3">
              <div className="bg-violet-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Afiliados selecionados:</span>
                  <span className="font-medium">{selecionados.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal de comissões:</span>
                  <span className="font-medium">{formatCurrency(totalSaldo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa BongiaTech (3%):</span>
                  <span className="font-medium text-orange-600">{formatCurrency(taxaPlataforma)}</span>
                </div>
                <div className="border-t border-violet-200 pt-2 flex justify-between font-bold">
                  <span className="text-gray-900">Total debitado da sua conta Asaas:</span>
                  <span className="text-violet-700">{formatCurrency(totalSaldo)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                A taxa de 3% será cobrada na sua fatura mensal separadamente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalAberto(false)}
                  disabled={pagando}
                  className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarPagamento}
                  disabled={pagando}
                  className="flex-1 bg-violet-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {pagando && <Loader2 className="w-4 h-4 animate-spin" />}
                  {pagando ? 'Enviando PIX...' : `Confirmar e pagar ${selecionados.length} afiliados`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

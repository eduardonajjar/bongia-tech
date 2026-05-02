'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { UserPlus, Copy, Check, MoreHorizontal } from 'lucide-react'
import type { Afiliado } from '@/types/afiliado'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default function AfiliadosPage() {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'inativos' | 'saldo'>('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [form, setForm] = useState({ nome: '', email: '', chave_pix: '', tipo_pix: 'cpf', comissao: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/afiliados')
    const data = await res.json()
    setAfiliados(data)
    setCarregando(false)
  }

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const res = await fetch('/api/afiliados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        chave_pix: form.chave_pix || undefined,
        tipo_pix: form.tipo_pix || undefined,
        comissao: form.comissao ? parseFloat(form.comissao) : undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setErro(data.erro || 'Erro ao adicionar afiliado')
      setEnviando(false)
      return
    }

    setAfiliados((prev) => [data, ...prev])
    setModalAberto(false)
    setForm({ nome: '', email: '', chave_pix: '', tipo_pix: 'cpf', comissao: '' })
    setEnviando(false)
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch(`/api/afiliados/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    setAfiliados((prev) => prev.map((a) => a.id === id ? { ...a, ativo: !ativo } : a))
  }

  function copiarLink(refCode: string) {
    const link = `${APP_URL}/loja?ref=${refCode}`
    navigator.clipboard.writeText(link)
    setCopiado(refCode)
    setTimeout(() => setCopiado(null), 2000)
  }

  const filtrados = afiliados.filter((a) => {
    if (filtro === 'ativos') return a.ativo
    if (filtro === 'inativos') return !a.ativo
    if (filtro === 'saldo') return a.saldo > 0
    return true
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Afiliados</h1>
          <p className="text-gray-500 text-sm mt-1">{afiliados.length} afiliados cadastrados</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Adicionar afiliado
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {(['todos', 'ativos', 'inativos', 'saldo'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'ativos' ? 'Ativos' : f === 'inativos' ? 'Inativos' : 'Com saldo'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {carregando ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhum afiliado encontrado.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nome', 'Email', 'Vendas totais', 'Saldo a pagar', 'Cliques', 'Status', 'Link', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">{a.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(a.total_vendas)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-700">{formatCurrency(a.saldo)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.total_cliques}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copiarLink(a.ref_code)}
                      className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800"
                    >
                      {copiado === a.ref_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiado === a.ref_code ? 'Copiado!' : 'Copiar link'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAtivo(a.id, a.ativo)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {a.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal adicionar */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Adicionar afiliado</h2>
              <p className="text-sm text-gray-500 mt-0.5">O afiliado receberá um email com o link dele.</p>
            </div>
            <form onSubmit={adicionar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comissão % (opcional)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={form.comissao}
                  onChange={(e) => setForm((f) => ({ ...f, comissao: e.target.value }))}
                  placeholder="Usa o padrão da loja se vazio"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo PIX</label>
                  <select
                    value={form.tipo_pix}
                    onChange={(e) => setForm((f) => ({ ...f, tipo_pix: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">Email</option>
                    <option value="telefone">Telefone</option>
                    <option value="chave_aleatoria">Chave aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={form.chave_pix}
                    onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {erro && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{erro}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalAberto(false); setErro('') }}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {enviando ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight, ChevronLeft } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const fmtData = (s: string) =>
  new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })

interface Lojista {
  id: string; nome: string; email: string; plano: string; ativo: boolean
  trial_ate: string; criado_em: string; afiliados: number; volume: number; taxa: number
}

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'trial', label: 'Em trial' },
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'inativos', label: 'Inativos' },
]

export default function AdminLojistasPage() {
  const router = useRouter()
  const [lojistas, setLojistas] = useState<Lojista[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [buscaInput, setBuscaInput] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ filtro, busca, page: String(page) })
    const res = await fetch(`/api/admin/lojistas?${params}`)
    const data = await res.json()
    setLojistas(data.lojistas || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [filtro, busca, page])

  useEffect(() => { load() }, [load])

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    setBusca(buscaInput)
    setPage(1)
  }

  function handleFiltro(f: string) {
    setFiltro(f)
    setPage(1)
  }

  const agora = new Date()
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lojistas</h1>
        <p className="text-gray-500 text-sm mt-1">{total} lojistas encontrados</p>
      </div>

      {/* Filtros + busca */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFiltro(f.key)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filtro === f.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleBusca} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              placeholder="Nome ou email..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 w-56"
            />
          </div>
          <button type="submit" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Buscar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lojista</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Afiliados</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Volume</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Taxa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cadastro</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">Carregando...</td>
              </tr>
            ) : lojistas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">Nenhum lojista encontrado</td>
              </tr>
            ) : (
              lojistas.map((l) => {
                const emTrial = l.trial_ate && new Date(l.trial_ate) > agora
                const status = !l.ativo ? 'Inativo' : emTrial ? 'Trial' : 'Ativo'
                const statusCor = !l.ativo ? 'bg-red-100 text-red-700' :
                  emTrial ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                return (
                  <tr
                    key={l.id}
                    onClick={() => router.push(`/admin/lojistas/${l.id}`)}
                    className="border-b border-gray-50 hover:bg-violet-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{l.nome}</p>
                      <p className="text-xs text-gray-400">{l.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.plano === 'pro' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {l.plano}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{l.afiliados}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(l.volume)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{fmt(l.taxa)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtData(l.criado_em)}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Página {page} de {totalPages} · {total} lojistas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" /> Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Próxima <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

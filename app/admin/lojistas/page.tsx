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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Lojistas</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>{total} lojistas encontrados</p>
      </div>

      {/* Filtros + busca */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFiltro(f.key)}
              style={{
                fontSize: '12px', padding: '4px 12px', fontWeight: 300, cursor: 'pointer',
                background: filtro === f.key ? '#f5f3f0' : 'transparent',
                border: '1px solid rgba(255,255,255,0.07)',
                color: filtro === f.key ? '#0c0b0a' : '#6b6560',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleBusca} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ width: '14px', height: '14px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b6560' }} />
            <input
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              placeholder="Nome ou email..."
              style={{
                paddingLeft: '32px', paddingRight: '1rem', paddingTop: '8px', paddingBottom: '8px',
                fontSize: '13px', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0', outline: 'none',
                width: '224px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              fontSize: '13px', background: '#f5f3f0', color: '#0c0b0a',
              padding: '8px 16px', border: 'none', cursor: 'pointer', fontWeight: 500,
            }}
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              {['Lojista', 'Plano', 'Status', 'Afiliados', 'Volume', 'Taxa', 'Cadastro', ''].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: h === 'Afiliados' || h === 'Volume' || h === 'Taxa' ? 'right' : 'left',
                  fontSize: '10px', fontWeight: 400, color: '#4a4440',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#6b6560', fontWeight: 300 }}>Carregando...</td>
              </tr>
            ) : lojistas.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#6b6560', fontWeight: 300 }}>Nenhum lojista encontrado</td>
              </tr>
            ) : (
              lojistas.map((l) => {
                const emTrial = l.trial_ate && new Date(l.trial_ate) > agora
                const status = !l.ativo ? 'Inativo' : emTrial ? 'Trial' : 'Ativo'
                const statusColor = !l.ativo ? '#f87171' : emTrial ? '#d97706' : '#4ade80'
                return (
                  <tr
                    key={l.id}
                    onClick={() => router.push(`/admin/lojistas/${l.id}`)}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                    className="admin-row"
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 400, color: '#f5f3f0' }}>{l.nome}</p>
                      <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>{l.email}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: l.plano === 'pro' ? '#7c3aed' : '#6b6560', fontWeight: 400,
                      }}>
                        {l.plano}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: statusColor, fontWeight: 400,
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b6560', fontWeight: 300 }}>{l.afiliados}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b6560', fontWeight: 300 }}>{fmt(l.volume)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#f5f3f0' }}>{fmt(l.taxa)}</td>
                    <td style={{ padding: '12px 16px', color: '#4a4440', fontSize: '11px', fontWeight: 300 }}>{fmtData(l.criado_em)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <ChevronRight style={{ width: '14px', height: '14px', color: '#4a4440' }} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>
              Página {page} de {totalPages} · {total} lojistas
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', padding: '6px 12px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#6b6560', cursor: 'pointer', fontWeight: 300,
                  opacity: page === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft style={{ width: '12px', height: '12px' }} /> Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', padding: '6px 12px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#6b6560', cursor: 'pointer', fontWeight: 300,
                  opacity: page === totalPages ? 0.4 : 1,
                }}
              >
                Próxima <ChevronRight style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-row:hover { background: rgba(255,255,255,0.02) !important; }
      `}</style>
    </div>
  )
}

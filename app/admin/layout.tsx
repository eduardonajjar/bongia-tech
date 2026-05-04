import Link from 'next/link'
import { LayoutDashboard, Users, TrendingUp, ArrowLeft } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/admin/lojistas', label: 'Lojistas', icon: Users },
  { href: '/admin/metricas', label: 'Métricas', icon: TrendingUp },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0c0b0a' }}>
      <aside style={{
        width: '240px', flexShrink: 0,
        background: '#111010',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.125rem', color: '#f5f3f0', fontWeight: 400 }}>
              BongiaTech
            </h1>
            <span style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: '10px', fontWeight: 600,
              padding: '2px 6px', letterSpacing: '0.06em',
            }}>
              ADMIN
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#4a4440', fontWeight: 300 }}>Painel do dono</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '6px 10px',
                fontSize: '13px', color: '#6b6560', textDecoration: 'none',
                fontWeight: 300,
              }}
              className="admin-nav-link"
            >
              <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#4a4440', textDecoration: 'none', fontWeight: 300,
            }}
            className="admin-nav-link"
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Voltar para loja
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', background: '#0c0b0a' }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover { color: #f5f3f0 !important; }
      `}</style>
    </div>
  )
}

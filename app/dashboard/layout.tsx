import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, Users, ShoppingCart, CreditCard, Settings, Link2 } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

const NAV = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/afiliados', label: 'Afiliados', icon: Users },
  { href: '/dashboard/vendas', label: 'Vendas', icon: ShoppingCart },
  { href: '/dashboard/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/dashboard/integracao', label: 'Integração', icon: Link2 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('nome, trial_ate, plano, onboarding_concluido')
    .eq('id', user.id)
    .single()

  // Redireciona lojista novo para onboarding (exceto se já está no onboarding)
  const headersList = await headers()
  const currentPath = headersList.get('x-pathname') || ''

  if (lojista && !lojista.onboarding_concluido && !currentPath.includes('/onboarding')) {
    redirect('/dashboard/onboarding')
  }

  const trialExpira = lojista?.trial_ate ? new Date(lojista.trial_ate) : null
  const diasTrial = trialExpira
    ? Math.max(0, Math.ceil((trialExpira.getTime() - Date.now()) / 86400000))
    : 0
  const emTrial = diasTrial > 0

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0c0b0a' }}>
      <aside style={{
        width: '240px', flexShrink: 0,
        background: '#0c0b0a',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.125rem', color: '#f5f3f0', fontWeight: 400 }}>
            BongiaTech
          </h1>
          {lojista?.nome && (
            <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 300 }}>
              {lojista.nome}
            </p>
          )}
        </div>

        {emTrial && (
          <div style={{
            margin: '1rem',
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)',
            padding: '0.75rem',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#d97706' }}>Trial: {diasTrial} dias restantes</p>
            <Link href="/dashboard/configuracoes" style={{ fontSize: '11px', color: '#d97706', textDecoration: 'underline', marginTop: '2px', display: 'block', fontWeight: 300 }}>
              Assinar agora
            </Link>
          </div>
        )}

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
                transition: 'color 0.15s',
              }}
              className="nav-link-dark"
            >
              <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <LogoutButton />
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', background: '#0c0b0a' }}>
        {children}
      </main>

      <style>{`
        .nav-link-dark:hover { color: #f5f3f0 !important; }
      `}</style>
    </div>
  )
}

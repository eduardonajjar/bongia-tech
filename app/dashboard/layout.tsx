import { redirect } from 'next/navigation'
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

  // Redireciona lojista novo para onboarding
  // O próprio /dashboard/onboarding não usa este layout, então não há loop
  if (lojista && !lojista.onboarding_concluido) {
    redirect('/dashboard/onboarding')
  }

  const trialExpira = lojista?.trial_ate ? new Date(lojista.trial_ate) : null
  const diasTrial = trialExpira
    ? Math.max(0, Math.ceil((trialExpira.getTime() - Date.now()) / 86400000))
    : 0
  const emTrial = diasTrial > 0

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">
            Bongia<span className="text-violet-600">Tech</span>
          </h1>
          {lojista?.nome && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{lojista.nome}</p>
          )}
        </div>

        {emTrial && (
          <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-800">Trial: {diasTrial} dias restantes</p>
            <Link href="/dashboard/configuracoes" className="text-xs text-amber-700 underline mt-0.5 block">
              Assinar agora
            </Link>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

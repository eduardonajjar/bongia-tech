import Link from 'next/link'
import { LayoutDashboard, Users, TrendingUp, ArrowLeft } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/admin/lojistas', label: 'Lojistas', icon: Users },
  { href: '/admin/metricas', label: 'Métricas', icon: TrendingUp },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">
              Bongia<span className="text-violet-400">Tech</span>
            </h1>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </div>
          <p className="text-gray-500 text-xs">Painel do dono</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para loja
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

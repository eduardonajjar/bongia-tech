'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        width: '100%', padding: '6px 10px',
        fontSize: '13px', color: '#6b6560', fontWeight: 300,
        background: 'none', border: 'none', cursor: 'pointer',
        transition: 'color 0.15s',
      }}
      className="logout-btn"
    >
      <LogOut style={{ width: '14px', height: '14px' }} />
      Sair
      <style>{`.logout-btn:hover { color: #f5f3f0 !important; }`}</style>
    </button>
  )
}

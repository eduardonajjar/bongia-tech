import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enviarAlertaTrialExpirando } from '@/lib/integrations/resend'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
  }

  const { email, nome } = await req.json()
  if (!email || !nome) {
    return NextResponse.json({ erro: 'email e nome obrigatórios' }, { status: 400 })
  }

  await enviarAlertaTrialExpirando({ email, nome, vendasGeradas: 0, comissaoTotal: 0 })
  return NextResponse.json({ ok: true })
}

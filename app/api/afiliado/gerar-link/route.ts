import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { gerarTokenMagico } from '@/lib/afiliado/session'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Lojista gera link de acesso para um afiliado seu (sem depender de email)
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, erro: 'Não autorizado' }, { status: 401 })
  }

  const afiliadoId = req.nextUrl.searchParams.get('id')
  if (!afiliadoId) {
    return NextResponse.json({ ok: false, erro: 'ID obrigatório' }, { status: 400 })
  }

  // Verifica que o afiliado pertence ao lojista logado
  const service = await createServiceClient()
  const { data: afiliado } = await service
    .from('afiliados')
    .select('id, email, nome')
    .eq('id', afiliadoId)
    .eq('lojista_id', user.id)
    .eq('ativo', true)
    .single()

  if (!afiliado) {
    return NextResponse.json({ ok: false, erro: 'Afiliado não encontrado' }, { status: 404 })
  }

  const token = gerarTokenMagico(afiliado.email)
  const link = `${APP_URL}/api/afiliado/auth?token=${encodeURIComponent(token)}`

  return NextResponse.json({ ok: true, link, nome: afiliado.nome, email: afiliado.email })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ erro: 'Token obrigatório' }, { status: 400 })

  const supabase = await createServiceClient()

  const { data: afiliado } = await supabase
    .from('afiliados')
    .select('id')
    .eq('token', token)
    .single()

  if (!afiliado) return NextResponse.json({ erro: 'Afiliado não encontrado' }, { status: 404 })

  await supabase.from('cliques').delete().eq('afiliado_id', afiliado.id)
  await supabase.from('afiliados').update({
    nome: '[removido]',
    email: '[removido]',
    chave_pix: null,
    ativo: false,
  }).eq('id', afiliado.id)

  return NextResponse.json({ ok: true })
}

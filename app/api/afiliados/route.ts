import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateRefCode } from '@/lib/utils'
import { enviarBoasVindasAfiliado } from '@/lib/integrations/resend'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('afiliados')
    .select('*')
    .eq('lojista_id', user.id)
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { nome, email, chave_pix, tipo_pix, comissao } = body

  if (!nome || !email) {
    return NextResponse.json({ erro: 'Nome e email são obrigatórios' }, { status: 400 })
  }

  const serviceClient = await createServiceClient()

  // ── Limite de plano ───────────────────────────────────────────────────────
  const { data: lojistaPlan } = await supabase
    .from('lojistas')
    .select('plano')
    .eq('id', user.id)
    .single()

  const plano = lojistaPlan?.plano || 'starter'

  if (plano === 'starter') {
    const { count } = await serviceClient
      .from('afiliados')
      .select('id', { count: 'exact', head: true })
      .eq('lojista_id', user.id)
      .eq('ativo', true)

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { erro: 'Limite do plano Grátis atingido. Faça upgrade para o Pro e tenha afiliados ilimitados.', upgrade: true },
        { status: 403 }
      )
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const ref_code = generateRefCode(nome)
  const { data: afiliado, error } = await serviceClient
    .from('afiliados')
    .insert({
      lojista_id: user.id,
      nome,
      email,
      chave_pix: chave_pix || null,
      tipo_pix: tipo_pix || null,
      comissao: comissao || null,
      ref_code,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ erro: 'Este email já está cadastrado como afiliado nesta loja' }, { status: 409 })
    }
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }

  const { data: lojista } = await supabase
    .from('lojistas')
    .select('nome')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const linkAfiliado = `${appUrl}/loja?ref=${ref_code}`

  await enviarBoasVindasAfiliado({
    nome: afiliado.nome,
    email: afiliado.email,
    token: afiliado.token,
    refCode: ref_code,
    nomeLoja: lojista?.nome || 'nossa loja',
    linkAfiliado,
  }).catch(() => {})

  return NextResponse.json(afiliado, { status: 201 })
}

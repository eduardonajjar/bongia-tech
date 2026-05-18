import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { gerarTokenMagico } from '@/lib/afiliado/session'
import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Debug — replica exatamente o solicitar-acesso passo a passo
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || 'eduardonajjar2@gmail.com'
  const emailLimpo = email.toLowerCase().trim()
  const passos: Record<string, unknown> = {}

  // Passo 1: createServiceClient
  let supabase
  try {
    supabase = await createServiceClient()
    passos['1_serviceClient'] = 'ok'
  } catch (e) {
    return NextResponse.json({ falhou_em: '1_serviceClient', erro: String(e), passos })
  }

  // Passo 2: query afiliados
  let afiliados
  try {
    const { data, error } = await supabase
      .from('afiliados')
      .select('id, email, ativo')
      .eq('email', emailLimpo)
      .limit(1)
    if (error) {
      return NextResponse.json({ falhou_em: '2_query', erro: error.message, passos })
    }
    afiliados = data
    passos['2_query'] = { encontrou: data?.length ?? 0, registros: data }
  } catch (e) {
    return NextResponse.json({ falhou_em: '2_query_catch', erro: String(e), passos })
  }

  // Passo 3: verificar ativo
  passos['3_ativo'] = { afiliadosLen: afiliados?.length, isEmpty: !afiliados || afiliados.length === 0 }
  if (!afiliados || afiliados.length === 0) {
    passos['resultado'] = 'retornaria ok:true (email nao encontrado ou inativo)'
    return NextResponse.json(passos)
  }

  // Passo 4: gerarTokenMagico
  let token, link
  try {
    token = gerarTokenMagico(emailLimpo)
    link = `${APP_URL}/api/afiliado/auth?token=${encodeURIComponent(token)}`
    passos['4_token'] = 'ok'
    passos['4_link'] = link
  } catch (e) {
    return NextResponse.json({ falhou_em: '4_token', erro: String(e), passos })
  }

  // Passo 5: Resend constructor
  let resend
  try {
    const key = process.env.RESEND_API_KEY || ''
    passos['5_resendKey'] = { len: key.length, prefix: key.substring(0, 8), hasBOM: key.charCodeAt(0) === 0xFEFF }
    resend = new Resend(key)
    passos['5_resendConstructor'] = 'ok'
  } catch (e) {
    return NextResponse.json({ falhou_em: '5_resend_constructor', erro: String(e), passos })
  }

  // Passo 6: Resend send (domínio pode não estar verificado)
  try {
    const r = await resend.emails.send({
      from: 'BongiaTech <noreply@bongiatech.com.br>',
      to: emailLimpo,
      subject: '[TESTE DEBUG] Link de acesso',
      html: `<p>Link: <a href="${link}">${link}</a></p>`,
    })
    passos['6_resendSend'] = { ok: true, id: (r as { id?: string }).id }
  } catch (e) {
    passos['6_resendSend'] = { falhou: true, erro: String(e) }
  }

  passos['resultado_final'] = 'retornaria ok:true'
  return NextResponse.json(passos)
}

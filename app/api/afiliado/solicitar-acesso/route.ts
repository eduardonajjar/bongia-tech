import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { gerarTokenMagico } from '@/lib/afiliado/session'
import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function getResendKey(): string {
  let key = (process.env.RESEND_API_KEY ?? '').trim()
  // Remove BOM (U+FEFF = 65279) do início — problema ao colar key no Vercel
  while (key.length > 0 && key.charCodeAt(0) === 0xFEFF) key = key.slice(1)
  return key
}

async function enviarEmailAcesso(email: string, link: string): Promise<void> {
  const key = getResendKey()
  if (!key || !key.startsWith('re_')) {
    console.warn('[solicitar-acesso] RESEND_API_KEY inválida ou ausente:', key.substring(0, 10))
    return
  }
  const resend = new Resend(key)
  await resend.emails.send({
    from: 'BongiaTech <noreply@bongiatech.com.br>',
    to: email,
    subject: 'Seu link de acesso ao painel de afiliado',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0c0b0a;color:#f5f3f0">
        <h2 style="font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 24px">BongiaTech</h2>
        <p style="color:#a09890;margin:0 0 24px">Clique no botão abaixo para acessar seu painel. O link expira em <strong style="color:#f5f3f0">1 hora</strong>.</p>
        <a href="${link}"
           style="background:#f5f3f0;color:#0c0b0a;padding:12px 28px;text-decoration:none;display:inline-block;font-size:14px;font-weight:500">
          Acessar meu painel
        </a>
        <p style="color:#4a4440;font-size:12px;margin-top:32px">Se você não solicitou este link, ignore este email.</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  // Parse body
  let email: string
  try {
    const body = await req.json()
    email = (body?.email ?? '').toString().toLowerCase().trim()
  } catch {
    return NextResponse.json({ ok: false, erro: 'Body inválido' }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, erro: 'Email inválido' }, { status: 400 })
  }

  // Busca afiliado no banco
  let afiliadoEncontrado = false
  let link = ''
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('afiliados')
      .select('id')
      .eq('email', email)
      .eq('ativo', true)
      .limit(1)

    if (data && data.length > 0) {
      afiliadoEncontrado = true
      const token = gerarTokenMagico(email)
      link = `${APP_URL}/api/afiliado/auth?token=${encodeURIComponent(token)}`
    }
  } catch (err) {
    console.error('[solicitar-acesso] erro no banco:', err)
    // Retorna ok:true mesmo com erro — evita enumeração
    return NextResponse.json({ ok: true })
  }

  // Se não encontrou, retorna silenciosamente
  if (!afiliadoEncontrado) {
    return NextResponse.json({ ok: true })
  }

  // Envia email — NUNCA deixa erro propagar
  try {
    await enviarEmailAcesso(email, link)
    console.log('[solicitar-acesso] email enviado para', email)
  } catch (emailErr) {
    console.warn('[solicitar-acesso] falha no email:', String(emailErr))
    console.log('[solicitar-acesso] link manual:', link)
  }

  return NextResponse.json({ ok: true })
}

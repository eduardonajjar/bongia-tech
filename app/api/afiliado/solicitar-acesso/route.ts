import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { gerarTokenMagico } from '@/lib/afiliado/session'
import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, erro: 'Email inválido' }, { status: 400 })
    }

    const emailLimpo = email.toLowerCase().trim()
    const supabase = await createServiceClient()

    // Verifica se existe pelo menos 1 afiliado ativo com esse email
    const { data: afiliados } = await supabase
      .from('afiliados')
      .select('id')
      .eq('email', emailLimpo)
      .eq('ativo', true)
      .limit(1)

    // Responde sempre com sucesso (evita enumeração de emails)
    if (!afiliados || afiliados.length === 0) {
      return NextResponse.json({ ok: true })
    }

    // Gera token mágico
    const token = gerarTokenMagico(emailLimpo)
    const link = `${APP_URL}/api/afiliado/auth?token=${encodeURIComponent(token)}`

    // Tenta enviar email — ignora erro de domínio não verificado
    try {
      const resend = new Resend(process.env.RESEND_API_KEY || '')
      await resend.emails.send({
        from: 'BongiaTech <noreply@bongiatech.com.br>',
        to: emailLimpo,
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
      console.log('[solicitar-acesso] email enviado para', emailLimpo)
    } catch (emailErr) {
      // Email falhou (domínio não verificado, etc) — loga o link para uso manual
      console.warn('[solicitar-acesso] falha no email:', emailErr)
      console.log('[solicitar-acesso] link manual:', link)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[solicitar-acesso] erro:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

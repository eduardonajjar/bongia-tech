import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { trocarCodigoPorToken, obterLoja, registrarWebhook } from '@/lib/integrations/nuvemshop'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?erro=sem_codigo', req.url))
  }

  try {
    // 1. Trocar código por token Nuvemshop
    const { access_token, user_id } = await trocarCodigoPorToken(
      process.env.NUVEMSHOP_CLIENT_ID!,
      process.env.NUVEMSHOP_CLIENT_SECRET!,
      code
    )

    // 2. Buscar dados da loja (email + nome)
    const loja = await obterLoja(access_token, user_id)
    const email = loja.contact_email || loja.email
    const nome = loja.name

    if (!email) {
      throw new Error('Não foi possível obter o email da loja Nuvemshop')
    }

    const admin = createAdminClient()
    const service = await createServiceClient()

    // 3. Verificar se lojista já existe pelo email
    const { data: lojistExistente } = await service
      .from('lojistas')
      .select('id')
      .eq('email', email)
      .single()

    let userId: string

    if (lojistExistente) {
      // Lojista já existe — só loga
      userId = lojistExistente.id
    } else {
      // Primeiro acesso — criar conta Supabase (o trigger handle_new_user cria o registro em lojistas)
      const { data: novoUser, error: erroCriacao } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome },
      })

      if (erroCriacao || !novoUser.user) {
        throw new Error(`Erro ao criar usuário: ${erroCriacao?.message}`)
      }

      userId = novoUser.user.id
    }

    // 4. Salvar token Nuvemshop + store_id no lojista
    await service
      .from('lojistas')
      .update({
        nuvemshop_token: access_token,
        nuvemshop_store_id: user_id,
        nome, // atualiza nome com o nome real da loja
      })
      .eq('id', userId)

    // 5. Registrar webhook para order/paid (ignora erro se já existe)
    await registrarWebhook(
      access_token,
      user_id,
      `${APP_URL}/api/webhooks/nuvemshop`
    ).catch(() => {})

    // 6. Gerar magic link server-side — redireciona o lojista para dentro do dashboard sem senha
    const { data: linkData, error: erroLink } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${APP_URL}/dashboard`,
      },
    })

    if (erroLink || !linkData?.properties?.action_link) {
      throw new Error(`Erro ao gerar link de acesso: ${erroLink?.message}`)
    }

    // 7. Redirecionar para Supabase → cria sessão → cai no /dashboard
    return NextResponse.redirect(linkData.properties.action_link)
  } catch (err) {
    console.error('[nuvemshop/callback] erro:', err)
    return NextResponse.redirect(new URL('/login?erro=nuvemshop', req.url))
  }
}

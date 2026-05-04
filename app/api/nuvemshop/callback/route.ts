import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { trocarCodigoPorToken, obterLoja, registrarWebhook, extrairNomeLoja } from '@/lib/integrations/nuvemshop'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?erro=sem_codigo', req.url))
  }

  try {
    console.log('[callback] step 1: trocando código por token')
    // Limpa BOM e espaços que o PowerShell pode injetar nas env vars
    const clientId = (process.env.NUVEMSHOP_CLIENT_ID || '').replace(/^﻿/, '').trim()
    const clientSecret = (process.env.NUVEMSHOP_CLIENT_SECRET || '').replace(/^﻿/, '').trim()
    console.log('[callback] clientId:', clientId, 'secretLen:', clientSecret.length, 'secretPrefix:', clientSecret.slice(0, 8))
    // 1. Trocar código por token Nuvemshop
    const { access_token, user_id } = await trocarCodigoPorToken(
      clientId,
      clientSecret,
      code
    )

    console.log('[callback] step 2: buscando dados da loja, user_id:', user_id)
    // 2. Buscar dados da loja (email + nome)
    const loja = await obterLoja(access_token, user_id)
    const email = loja.contact_email || loja.email
    const nome = extrairNomeLoja(loja.name)

    if (!email) {
      throw new Error('Não foi possível obter o email da loja Nuvemshop')
    }

    console.log('[callback] step 3: email:', email, 'nome:', nome)
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
      userId = lojistExistente.id
    } else {
      // Tentar criar — se já existir em auth, pegar via listUsers com filtro
      const { data: novoUser, error: erroCriacao } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome },
      })

      if (novoUser?.user) {
        userId = novoUser.user.id
      } else {
        // Usuário já existe em auth.users — buscar pelo email
        console.log('[callback] createUser falhou:', erroCriacao?.message, '— buscando usuário existente')
        const { data: found } = await admin.auth.admin.listUsers({ perPage: 1000 })
        const existing = found?.users?.find((u) => u.email === email)
        if (!existing) throw new Error(`Usuário não encontrado após criar: ${erroCriacao?.message}`)
        userId = existing.id
        // Garantir que existe na tabela lojistas
        await service.from('lojistas').upsert(
          { id: userId, email, nome, plano: 'starter', ativo: true },
          { onConflict: 'id' }
        )
      }
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

    console.log('[callback] step 6: gerando magic link para', email)
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
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[nuvemshop/callback] erro:', msg)
    return NextResponse.redirect(new URL(`/login?erro=nuvemshop&detalhe=${encodeURIComponent(msg)}`, req.url))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { trocarCodigoPorToken, obterLoja, registrarWebhook, registrarScriptTag, extrairNomeLoja } from '@/lib/integrations/nuvemshop'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/[﻿]/g, '').trim()

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
    const emailBruto = loja.contact_email || loja.email || ''
    const email = emailBruto.replace(/﻿/g, '').replace(/​/g, '').trim().toLowerCase()
    const nome = (extrairNomeLoja(loja.name) || '').replace(/﻿/g, '').replace(/​/g, '').trim()
    console.log('[callback] emailBruto:', JSON.stringify(emailBruto), 'emailLimpo:', JSON.stringify(email))

    if (!email) {
      throw new Error('Não foi possível obter o email da loja Nuvemshop')
    }

    console.log('[callback] step 3: email:', email, 'nome:', nome)
    const admin = createAdminClient()
    const service = await createServiceClient()

    // 3. Verificar se lojista já existe pelo email (maybeSingle não lança erro se não achar)
    const { data: lojistaExistente, error: erroLojista } = await service
      .from('lojistas')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (erroLojista) throw new Error(`Erro ao consultar lojista: ${erroLojista.message}`)

    let userId: string

    if (lojistaExistente) {
      // Email já existe em lojistas — usa o id existente, sem tentar createUser
      console.log('[callback] lojista encontrado em lojistas, id:', lojistaExistente.id)
      userId = lojistaExistente.id
    } else {
      // Email não existe em lojistas.
      // Limpa possível órfão (email em lojistas sem auth correspondente) para não derrubar o trigger
      await service.from('lojistas').delete().eq('email', email)

      // Cria usuário em auth.users (trigger handle_new_user insere em lojistas automaticamente)
      const { data: novoUser, error: erroCriacao } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome },
      })

      if (novoUser?.user) {
        userId = novoUser.user.id
        console.log('[callback] novo usuário criado, id:', userId)
      } else {
        // createUser falhou — usuário já existe em auth mas não em lojistas
        console.log('[callback] createUser falhou:', erroCriacao?.message, '— buscando em auth')
        const { data: found } = await admin.auth.admin.listUsers({ perPage: 1000 })
        const existing = found?.users?.find((u) => u.email === email)
        if (!existing) throw new Error(`Usuário não encontrado: ${erroCriacao?.message}`)
        userId = existing.id
        await service.from('lojistas').upsert(
          { id: userId, email, nome, plano: 'starter', ativo: true },
          { onConflict: 'id' }
        )
      }
    }

    // 4. Salvar token Nuvemshop + store_id + store_url no lojista
    const storeUrl = loja.url || null
    await service
      .from('lojistas')
      .update({
        nuvemshop_token: access_token,
        nuvemshop_store_id: user_id,
        nuvemshop_store_url: storeUrl,
        nome,
      } as any)
      .eq('id', userId)

    // 5. Registrar webhook para order/paid (ignora erro se já existe)
    await registrarWebhook(
      access_token,
      user_id,
      `${APP_URL}/api/webhooks/nuvemshop`
    ).catch(() => {})

    // 5b. Registrar script tag do tracker em todas as páginas da loja
    await registrarScriptTag(
      access_token,
      user_id,
      `${APP_URL}/tracker.js`
    ).catch(() => {})

    console.log('[callback] step 6: gerando magic link para', email)
    // 6. Gerar magic link server-side
    const { data: linkData, error: erroLink } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (erroLink || !linkData?.properties?.hashed_token) {
      throw new Error(`Erro ao gerar link de acesso: ${erroLink?.message}`)
    }

    // 7. Redirecionar para /auth/callback que faz verifyOtp server-side (seta cookies)
    // Isso evita o problema do hash fragment que o servidor não enxerga
    const authCallbackUrl = new URL('/auth/callback', APP_URL)
    authCallbackUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
    authCallbackUrl.searchParams.set('type', 'magiclink')
    authCallbackUrl.searchParams.set('next', '/dashboard')

    console.log('[callback] redirecionando para auth/callback com token_hash')
    return NextResponse.redirect(authCallbackUrl.toString())
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[nuvemshop/callback] erro:', msg)
    return NextResponse.redirect(new URL(`/login?erro=nuvemshop&detalhe=${encodeURIComponent(msg)}`, req.url))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { registrarScriptTag } from '@/lib/integrations/nuvemshop'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/[﻿﻿]/g, '').trim()
const ADMIN_SECRET = process.env.ADMIN_SECRET || ''

export async function POST(req: NextRequest) {
  // Proteção simples por secret
  const auth = req.headers.get('x-admin-secret')
  if (ADMIN_SECRET && auth !== ADMIN_SECRET) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const service = await createServiceClient()

  // Busca todos os lojistas com token Nuvemshop
  const { data: lojistas, error } = await service
    .from('lojistas')
    .select('id, email, nuvemshop_token, nuvemshop_store_id')
    .not('nuvemshop_token', 'is', null)
    .not('nuvemshop_store_id', 'is', null)

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  const resultados: Array<{ email: string; status: string }> = []
  const scriptUrl = `${APP_URL}/tracker.js`

  for (const lojista of lojistas ?? []) {
    try {
      await registrarScriptTag(lojista.nuvemshop_token, lojista.nuvemshop_store_id, scriptUrl)
      resultados.push({ email: lojista.email, status: 'ok' })
    } catch (err) {
      resultados.push({ email: lojista.email, status: String(err) })
    }
  }

  return NextResponse.json({ scriptUrl, resultados })
}

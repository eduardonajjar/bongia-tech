import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Endpoint temporário de debug — remover após diagnóstico
export async function GET(req: NextRequest) {
  const resultado: Record<string, unknown> = {}

  // 1. Verifica env vars (só presença, não valor)
  resultado.envs = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'não definida',
  }

  // 2. Testa createServiceClient
  try {
    const supabase = await createServiceClient()
    resultado.serviceClient = 'ok'

    // 3. Testa query na tabela afiliados
    const { data, error } = await supabase
      .from('afiliados')
      .select('id, email')
      .limit(1)

    if (error) {
      resultado.supabaseQuery = { erro: error.message, code: error.code }
    } else {
      resultado.supabaseQuery = { ok: true, registros: data?.length ?? 0 }
    }
  } catch (e: unknown) {
    resultado.serviceClient = { erro: e instanceof Error ? e.message : String(e) }
  }

  // 4. Testa Resend API key (só verifica se está no formato certo)
  const resendKey = process.env.RESEND_API_KEY || ''
  resultado.resend = {
    keyPresente: resendKey.length > 0,
    keyPareceLegitima: resendKey.startsWith('re_') && resendKey.length > 20,
    keyValor: resendKey.length > 0 ? `${resendKey.substring(0, 6)}...` : 'VAZIA',
  }

  return NextResponse.json(resultado)
}

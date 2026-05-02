import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verificarContaAsaas } from '@/lib/integrations/asaas'
import { encrypt } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })

  const { api_key } = await req.json()
  if (!api_key) return NextResponse.json({ erro: 'API key é obrigatória' }, { status: 400 })

  try {
    const conta = await verificarContaAsaas(api_key)
    const keyEncriptada = encrypt(api_key)

    const { data: lojista } = await supabase
      .from('lojistas')
      .select('plano')
      .eq('id', user.id)
      .single()

    const isPro = lojista?.plano === 'pro'

    await supabase
      .from('lojistas')
      .update({
        asaas_api_key: keyEncriptada,
        pagamento_automatico_ativo: isPro,
      })
      .eq('id', user.id)

    return NextResponse.json({ ok: true, saldo: conta.balance, nome: conta.name, pagamento_ativo: isPro })
  } catch {
    return NextResponse.json({ erro: 'API key inválida ou sem acesso ao Asaas' }, { status: 400 })
  }
}

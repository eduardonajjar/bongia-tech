import { redirect, notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

// Magic link: /afiliado/[token] → redireciona para o dashboard
export default async function AfiliadoTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServiceClient()

  const { data: afiliado } = await supabase
    .from('afiliados')
    .select('id')
    .eq('token', token)
    .eq('ativo', true)
    .single()

  if (!afiliado) notFound()

  redirect(`/afiliado/${token}/dashboard`)
}

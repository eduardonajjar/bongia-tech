import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { obterLoja } from '@/lib/integrations/nuvemshop'

function generateSessionId(): string {
  const chars = 'abcdef0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${result.slice(0,8)}-${result.slice(8,12)}-4${result.slice(12,15)}-${result.slice(15,19)}-${result.slice(19,31)}`
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams

  if (!ref) {
    redirect('/')
  }

  const supabase = await createServiceClient()

  // Busca o afiliado pelo ref_code
  const { data: afiliado, error: erroAfiliado } = await supabase
    .from('afiliados')
    .select('id, lojista_id')
    .eq('ref_code', ref)
    .eq('ativo', true)
    .single()

  console.log('[loja] ref:', ref, 'afiliado:', afiliado, 'erro:', erroAfiliado?.message)

  if (!afiliado) {
    redirect('/')
  }

  // Busca dados do lojista para saber a URL da loja
  const { data: lojista, error: erroLojista } = await supabase
    .from('lojistas')
    .select('nuvemshop_token, nuvemshop_store_id, nuvemshop_store_url')
    .eq('id', afiliado.lojista_id)
    .single()

  console.log('[loja] lojista store_id:', lojista?.nuvemshop_store_id, 'store_url:', (lojista as any)?.nuvemshop_store_url, 'erro:', erroLojista?.message)

  if (!lojista?.nuvemshop_store_id) {
    redirect('/')
  }

  // Gera session_id único para rastrear esta visita
  const sessionId = generateSessionId()

  // Registra o clique no banco
  const ip = null // server component não tem acesso fácil ao IP real
  await supabase.from('cliques').insert({
    afiliado_id: afiliado.id,
    session_id: sessionId,
    url_origem: null,
  })

  // Determina URL da loja
  let storeUrl = (lojista as any).nuvemshop_store_url || null

  // Se não tiver salva, busca via API e salva para próximas visitas
  if (!storeUrl && lojista.nuvemshop_token) {
    try {
      const lojaInfo = await obterLoja(lojista.nuvemshop_token, lojista.nuvemshop_store_id)
      storeUrl = lojaInfo.url
      // Salva para não precisar buscar da API toda vez
      await supabase
        .from('lojistas')
        .update({ nuvemshop_store_url: storeUrl } as any)
        .eq('id', afiliado.lojista_id)
    } catch {
      redirect('/')
    }
  }

  if (!storeUrl) redirect('/')

  // Garante que a URL tem protocolo
  if (!storeUrl.startsWith('http')) {
    storeUrl = 'https://' + storeUrl
  }

  // Redireciona para a loja com o session_id na URL
  // O tracker.js na loja vai ler o ?sid= e setar o cookie no domínio correto
  const lojaUrl = new URL(storeUrl)
  lojaUrl.searchParams.set('bt_sid', sessionId)
  lojaUrl.searchParams.set('bt_ref', ref)

  redirect(lojaUrl.toString())
}

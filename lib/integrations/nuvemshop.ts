const NUVEMSHOP_API = 'https://api.nuvemshop.com.br/v1'
// Custom Fields requerem a API versionada (2025-03)
const NUVEMSHOP_API_CF = 'https://api.nuvemshop.com.br/2025-03'

export interface NuvemshopOrderProduct {
  product_id: number
  name: string
  price: string        // preço unitário
  quantity: number
}

export interface NuvemshopOrder {
  id: number
  number: number
  status: string
  payment_status: string
  total: string        // valor total (produtos + frete - descontos)
  subtotal: string     // valor só dos produtos (sem frete)
  shipping: string     // valor do frete
  note: string | null  // nota do pedido (mantida para backward compat)
  customer: { name: string; email: string }
  products: NuvemshopOrderProduct[]
  created_at: string
}

export interface NuvemshopCustomField {
  id: string
  key: string
  name: string
  value_type: string
  read_only: boolean
  value?: string | null
}

// ─── Requisição v1 (endpoints clássicos) ─────────────────────────────────────
async function nuvemshopRequest<T>(
  token: string,
  storeId: string,
  method: string,
  path: string,
  body?: object | unknown[]
): Promise<T> {
  const res = await fetch(`${NUVEMSHOP_API}/${storeId}${path}`, {
    method,
    headers: {
      Authentication: `bearer ${token}`,
      'User-Agent': 'BongiaTech/1.0 (suporte@bongiatech.com.br)',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Nuvemshop API error ${res.status}: ${error}`)
  }

  return res.json()
}

// ─── Requisição versionada (Custom Fields) ────────────────────────────────────
async function nuvemshopRequestCF<T>(
  token: string,
  storeId: string,
  method: string,
  path: string,
  body?: object | unknown[]
): Promise<T> {
  const res = await fetch(`${NUVEMSHOP_API_CF}/${storeId}${path}`, {
    method,
    headers: {
      Authentication: `bearer ${token}`,
      'User-Agent': 'BongiaTech/1.0 (suporte@bongiatech.com.br)',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Nuvemshop CF API error ${res.status}: ${error}`)
  }

  return res.json()
}

// ─── Webhooks & Scripts ───────────────────────────────────────────────────────
export async function registrarWebhook(
  token: string,
  storeId: string,
  callbackUrl: string,
  event: string = 'order/paid'
) {
  return nuvemshopRequest(token, storeId, 'POST', '/webhooks', {
    event,
    url: callbackUrl,
  })
}

export async function registrarScriptTag(token: string, storeId: string, scriptUrl: string) {
  const existing = await nuvemshopRequest<Array<{ id: number; src: string }>>(
    token, storeId, 'GET', '/scripts'
  ).catch(() => [] as Array<{ id: number; src: string }>)

  const jaExiste = existing.some((s) => s.src === scriptUrl)
  if (jaExiste) return

  return nuvemshopRequest(token, storeId, 'POST', '/scripts', {
    src: scriptUrl,
    where: 'storefront',
    event: 'onfirstinteraction',
  })
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────
export async function obterPedido(
  token: string,
  storeId: string,
  orderId: string
): Promise<NuvemshopOrder> {
  return nuvemshopRequest<NuvemshopOrder>(token, storeId, 'GET', `/orders/${orderId}`)
}

export async function atualizarNotaPedido(
  token: string,
  storeId: string,
  orderId: string,
  note: string
): Promise<void> {
  await nuvemshopRequest(token, storeId, 'PUT', `/orders/${orderId}`, { note })
}

// ─── Custom Fields (API versionada 2025-03) ───────────────────────────────────

/**
 * Cria ou localiza o custom field bt_session na loja.
 * Deve ser chamado 1x por loja (no OAuth callback) e o ID salvo em lojistas.
 * Retorna o UUID do campo ou null em caso de erro.
 */
export async function criarOuObterCustomFieldBtSession(
  token: string,
  storeId: string
): Promise<string | null> {
  try {
    // Verifica se já existe
    const existentes = await nuvemshopRequestCF<NuvemshopCustomField[]>(
      token, storeId, 'GET', '/orders/custom-fields'
    )
    const encontrado = existentes?.find?.((c) => c.key === 'bt_session' || c.name === 'bt_session')
    if (encontrado) {
      console.log('[customField] já existe, id:', encontrado.id)
      return encontrado.id
    }

    // Cria novo
    const criado = await nuvemshopRequestCF<NuvemshopCustomField>(
      token, storeId, 'POST', '/orders/custom-fields', {
        name: 'bt_session',
        value_type: 'text',
        read_only: true,
      }
    )
    console.log('[customField] criado, id:', criado?.id)
    return criado?.id || null
  } catch (e) {
    console.error('[customField] erro ao criar/obter:', e)
    return null
  }
}

/**
 * Salva o session_id no custom field do pedido.
 * Substitui a injeção de bt= na nota do pedido.
 */
export async function salvarSessionIdNoPedido(
  token: string,
  storeId: string,
  orderId: string,
  customFieldId: string,
  sessionId: string
): Promise<void> {
  await nuvemshopRequestCF<void>(
    token, storeId, 'PUT', `/orders/${orderId}/custom-fields/values`,
    [{ id: customFieldId, value: sessionId }]
  )
}

/**
 * Lê o session_id do custom field do pedido.
 * Retorna null se não encontrado.
 */
export async function obterSessionIdDoPedido(
  token: string,
  storeId: string,
  orderId: string,
  customFieldId: string
): Promise<string | null> {
  try {
    const campos = await nuvemshopRequestCF<NuvemshopCustomField[]>(
      token, storeId, 'GET', `/orders/${orderId}/custom-fields`
    )
    const campo = campos?.find?.((c) => c.id === customFieldId)
    return campo?.value || null
  } catch {
    return null
  }
}

// ─── Loja & OAuth ─────────────────────────────────────────────────────────────
export interface NuvemshopLoja {
  id: number
  name: string | Record<string, string>
  url: string
  original_domain: string
  email: string
  contact_email: string
}

export function extrairNomeLoja(name: string | Record<string, string>): string {
  if (typeof name === 'string') return name
  return name?.pt || name?.es || name?.en || Object.values(name)[0] || 'Loja'
}

export async function obterLoja(token: string, storeId: string): Promise<NuvemshopLoja> {
  return nuvemshopRequest<NuvemshopLoja>(token, storeId, 'GET', '/store')
}

export function gerarUrlOAuth(clientId: string, redirectUri: string) {
  return `https://www.nuvemshop.com.br/apps/${clientId}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`
}

export async function trocarCodigoPorToken(
  clientId: string,
  clientSecret: string,
  code: string
): Promise<{ access_token: string; user_id: string }> {
  const payload = {
    client_id: Number(clientId),
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
  }
  console.log('[trocarToken] enviando: client_id=', payload.client_id, 'secret_len=', clientSecret.length, 'secret_prefix=', clientSecret.slice(0, 8))

  const res = await fetch('https://www.nuvemshop.com.br/apps/authorize/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const raw = await res.text()
  console.log('[trocarToken] status:', res.status, 'body:', raw)
  if (!res.ok) throw new Error(`Falha ao trocar código: ${raw}`)
  return JSON.parse(raw)
}

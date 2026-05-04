const NUVEMSHOP_API = 'https://api.nuvemshop.com.br/v1'

export interface NuvemshopOrder {
  id: number
  number: number
  status: string
  payment_status: string
  total: string
  customer: { name: string; email: string }
  created_at: string
}

async function nuvemshopRequest<T>(
  token: string,
  storeId: string,
  method: string,
  path: string,
  body?: object
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

export async function registrarWebhook(token: string, storeId: string, callbackUrl: string) {
  return nuvemshopRequest(token, storeId, 'POST', '/webhooks', {
    event: 'order/paid',
    url: callbackUrl,
  })
}

export async function obterPedido(
  token: string,
  storeId: string,
  orderId: string
): Promise<NuvemshopOrder> {
  return nuvemshopRequest<NuvemshopOrder>(token, storeId, 'GET', `/orders/${orderId}`)
}

export interface NuvemshopLoja {
  id: number
  name: string | Record<string, string>
  url: string
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

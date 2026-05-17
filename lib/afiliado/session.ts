import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.AFILIADO_SESSION_SECRET || 'dev-secret-change-in-prod'
export const COOKIE_SESSION = 'bt_afiliado'
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 dias

function assinar(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verificar<T extends { exp: number }>(token: string): T | null {
  try {
    const lastDot = token.lastIndexOf('.')
    if (lastDot === -1) return null
    const data = token.slice(0, lastDot)
    const sigBuf = Buffer.from(token.slice(lastDot + 1), 'base64url')
    const expectedBuf = Buffer.from(
      createHmac('sha256', SECRET).update(data).digest('base64url'),
      'base64url'
    )
    if (sigBuf.length !== expectedBuf.length) return null
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as T
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// Token mágico de 1 hora — enviado por email
export function gerarTokenMagico(email: string): string {
  return assinar({
    email: email.toLowerCase(),
    tipo: 'magic',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
}

export function verificarTokenMagico(token: string): string | null {
  const payload = verificar<{ email: string; tipo: string; exp: number }>(token)
  if (!payload || payload.tipo !== 'magic') return null
  return payload.email
}

// Session de 7 dias — guardada em cookie HttpOnly
export function gerarSessionToken(email: string): string {
  return assinar({
    email: email.toLowerCase(),
    tipo: 'session',
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  })
}

export function verificarSessionToken(token: string): string | null {
  const payload = verificar<{ email: string; tipo: string; exp: number }>(token)
  if (!payload || payload.tipo !== 'session') return null
  return payload.email
}

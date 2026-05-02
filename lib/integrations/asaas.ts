const ASAAS_BASE_URL = 'https://api.asaas.com/v3'

interface TransferPayload {
  chavePix: string
  valor: number
  nome: string
}

interface AsaasTransfer {
  id: string
  status: string
  value: number
  pixAddressKey: string
}

async function asaasRequest<T>(
  apiKey: string,
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    method,
    headers: {
      access_token: apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Asaas API error ${res.status}: ${error}`)
  }

  return res.json()
}

export async function verificarContaAsaas(apiKey: string) {
  return asaasRequest<{ balance: number; name: string }>(apiKey, 'GET', '/finance/balance')
}

export async function pagarAfiliados(
  apiKey: string,
  pagamentos: TransferPayload[]
): Promise<Array<{ sucesso: boolean; transferId?: string; erro?: string; chavePix: string }>> {
  const resultados = await Promise.allSettled(
    pagamentos.map((p) =>
      asaasRequest<AsaasTransfer>(apiKey, 'POST', '/transfers', {
        value: p.valor,
        pixAddressKey: p.chavePix,
        pixAddressKeyType: 'CPF',
        description: `Comissão BongiaTech - ${p.nome}`,
      })
    )
  )

  return resultados.map((r, i) => {
    if (r.status === 'fulfilled') {
      return { sucesso: true, transferId: r.value.id, chavePix: pagamentos[i].chavePix }
    }
    return { sucesso: false, erro: String(r.reason), chavePix: pagamentos[i].chavePix }
  })
}

export async function criarAssinaturaLojista(
  apiKey: string,
  dados: {
    nome: string
    email: string
    cpfCnpj: string
    valor: number
    descricao: string
  }
) {
  const customer = await asaasRequest<{ id: string }>(apiKey, 'POST', '/customers', {
    name: dados.nome,
    email: dados.email,
    cpfCnpj: dados.cpfCnpj,
  })

  return asaasRequest(apiKey, 'POST', '/subscriptions', {
    customer: customer.id,
    billingType: 'PIX',
    value: dados.valor,
    nextDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cycle: 'MONTHLY',
    description: dados.descricao,
  })
}

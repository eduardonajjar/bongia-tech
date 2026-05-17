import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarSessionToken, COOKIE_SESSION } from '@/lib/afiliado/session'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { TrendingUp, MousePointerClick, ShoppingBag, DollarSign } from 'lucide-react'
import CopiarLink from '../[token]/dashboard/CopiarLink'
import VendasLineChart, { DiaVenda } from '@/components/charts/VendasLineChart'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface Produto {
  nome: string
  quantidade: number
  preco_unitario: number
  total: number
}

export default async function AfiliadoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>
}) {
  // ── Autenticação via session cookie ──────────────────────────────────────
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(COOKIE_SESSION)?.value || ''
  const email = verificarSessionToken(sessionToken)

  if (!email) {
    redirect('/afiliado/login')
  }

  const { a: afiliadoId } = await searchParams
  const supabase = await createServiceClient()

  // Busca TODAS as lojas deste afiliado pelo email
  const { data: afiliados } = await supabase
    .from('afiliados')
    .select('id, nome, ref_code, saldo, total_cliques, lojista_id, lojistas(nome, nuvemshop_store_url)')
    .eq('email', email)
    .eq('ativo', true)
    .order('criado_em', { ascending: true })

  if (!afiliados || afiliados.length === 0) {
    redirect('/afiliado/login?erro=nao_encontrado')
  }

  // Se tem múltiplas lojas e nenhuma selecionada → tela de seleção
  if (afiliados.length > 1 && !afiliadoId) {
    redirect('/afiliado/escolher-loja')
  }

  // Seleciona o afiliado correto
  const afiliado = afiliadoId
    ? afiliados.find((a) => a.id === afiliadoId) ?? afiliados[0]
    : afiliados[0]

  const loja = afiliado.lojistas as unknown as { nome: string; nuvemshop_store_url: string | null } | null
  const linkAfiliado = `${APP_URL}/loja?ref=${afiliado.ref_code}`
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [vendasData, pagamentosData, vendasGrafico] = await Promise.all([
    supabase
      .from('vendas')
      .select('*')
      .eq('afiliado_id', afiliado.id)
      .order('criado_em', { ascending: false })
      .limit(50),
    supabase
      .from('pagamentos_afiliados')
      .select('*')
      .eq('afiliado_id', afiliado.id)
      .eq('status', 'concluido')
      .order('criado_em', { ascending: false })
      .limit(20),
    supabase
      .from('vendas')
      .select('valor_pedido, valor_comissao, criado_em')
      .eq('afiliado_id', afiliado.id)
      .gte('criado_em', trintaDiasAtras)
      .neq('status', 'cancelado')
      .order('criado_em', { ascending: true }),
  ])

  const vendas = vendasData.data || []
  const totalRecebido = pagamentosData.data?.reduce((s, p) => s + p.valor, 0) || 0

  // Agrupa por dia para o gráfico
  const mapaVendas: Record<string, DiaVenda> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const chave = d.toISOString().slice(0, 10)
    const dia = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    mapaVendas[chave] = { dia, vendas: 0, comissoes: 0, pedidos: 0 }
  }
  for (const v of vendasGrafico.data || []) {
    const chave = v.criado_em.slice(0, 10)
    if (mapaVendas[chave]) {
      mapaVendas[chave].vendas += v.valor_pedido
      mapaVendas[chave].comissoes += v.valor_comissao
      mapaVendas[chave].pedidos += 1
    }
  }
  const dadosGrafico = Object.values(mapaVendas)

  return (
    <div style={{ minHeight: '100vh', background: '#0c0b0a', color: '#f5f3f0', fontFamily: 'var(--sans)' }}>
      {/* Header */}
      <header style={{ background: '#111010', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          maxWidth: '896px', margin: '0 auto', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.125rem', color: '#f5f3f0', fontWeight: 400, margin: 0 }}>
              BongiaTech
            </h1>
            {loja && (
              <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300, margin: '2px 0 0' }}>
                Afiliado de {loja.nome}
                {afiliados.length > 1 && (
                  <a href="/afiliado/escolher-loja" style={{ marginLeft: '8px', color: '#d97706', textDecoration: 'none' }}>
                    Trocar loja →
                  </a>
                )}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', margin: 0 }}>{afiliado.nome}</p>
              <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300, margin: '2px 0 0' }}>{email}</p>
            </div>
            <a href="/api/afiliado/logout" style={{ fontSize: '11px', color: '#4a4440', textDecoration: 'none', fontWeight: 300 }}>
              Sair
            </a>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Link de afiliado */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem', marginTop: 0 }}>Seu link de afiliado</h2>
          <CopiarLink link={linkAfiliado} refCode={afiliado.ref_code} />
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem',
        }}>
          {[
            { label: 'Cliques no link', value: String(afiliado.total_cliques), icon: MousePointerClick },
            { label: 'Vendas geradas', value: String(vendas.length), icon: ShoppingBag },
            { label: 'A receber', value: formatCurrency(afiliado.saldo), icon: TrendingUp },
            { label: 'Total recebido', value: formatCurrency(totalRecebido), icon: DollarSign },
          ].map((card) => (
            <div key={card.label} style={{ background: '#111010', padding: '1.5rem' }}>
              <card.icon style={{ width: '15px', height: '15px', color: '#6b6560', marginBottom: '0.75rem' }} />
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: '#f5f3f0', marginBottom: '4px', marginTop: 0 }}>{card.value}</p>
              <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300, margin: 0 }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', margin: 0 }}>Comissões dos últimos 30 dias</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b6560', fontWeight: 300 }}>
              <span style={{ width: '20px', height: '1px', background: '#d97706', display: 'inline-block' }} />
              Comissões
            </span>
          </div>
          <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
            <VendasLineChart dados={dadosGrafico} mostrarComissao={true} />
          </div>
        </div>

        {/* Tabela de vendas */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', margin: 0 }}>Minhas vendas</h2>
          </div>
          {vendas.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>
              Nenhuma venda ainda. Compartilhe seu link para começar!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Data', 'Pedido', 'Produtos', 'Comissão', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: '10px', fontWeight: 400, color: '#4a4440', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => {
                  const produtos: Produto[] = v.produtos || []
                  const numeroPedido = v.numero_pedido ? `#${v.numero_pedido}` : `#${v.pedido_id}`
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontWeight: 300, whiteSpace: 'nowrap' }}>{formatDateTime(v.criado_em)}</td>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontFamily: 'monospace', fontWeight: 300 }}>{numeroPedido}</td>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontWeight: 300, minWidth: '180px' }}>
                        {produtos.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {produtos.map((p, i) => (
                              <div key={i}>
                                <span style={{ color: '#f5f3f0', fontWeight: 300 }}>{p.quantidade}× {p.nome}</span>
                                <span style={{ color: '#4a4440', marginLeft: '6px' }}>{formatCurrency(p.total)}</span>
                              </div>
                            ))}
                          </div>
                        ) : <span style={{ color: '#4a4440' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(v.valor_comissao)}</td>
                      <td style={{ padding: '12px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', fontSize: '11px', fontWeight: 400, border: '1px solid rgba(255,255,255,0.07)', color: v.status === 'pago' ? '#f5f3f0' : v.status === 'confirmado' ? '#6b6560' : '#d97706' }}>
                          {v.status === 'pago' ? 'Pago' : v.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagamentos recebidos */}
        {pagamentosData.data && pagamentosData.data.length > 0 && (
          <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', margin: 0 }}>Pagamentos recebidos</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Data', 'Valor recebido'].map((h) => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: '10px', fontWeight: 400, color: '#4a4440', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagamentosData.data.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontWeight: 300 }}>{formatDateTime(p.criado_em)}</td>
                    <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(p.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

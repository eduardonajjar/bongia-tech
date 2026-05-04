import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Copy, TrendingUp, MousePointerClick, ShoppingBag, DollarSign, CheckCircle } from 'lucide-react'
import CopiarLink from './CopiarLink'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function AfiliadoDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServiceClient()

  const { data: afiliado } = await supabase
    .from('afiliados')
    .select('*, lojistas(nome)')
    .eq('token', token)
    .eq('ativo', true)
    .single()

  if (!afiliado) notFound()

  const { data: vendas } = await supabase
    .from('vendas')
    .select('*')
    .eq('afiliado_id', afiliado.id)
    .order('criado_em', { ascending: false })
    .limit(50)

  const { data: pagamentosAfiliado } = await supabase
    .from('pagamentos_afiliados')
    .select('*')
    .eq('afiliado_id', afiliado.id)
    .eq('status', 'concluido')
    .order('criado_em', { ascending: false })
    .limit(20)

  const totalRecebido = pagamentosAfiliado?.reduce((s, p) => s + p.valor, 0) || 0
  const linkAfiliado = `${APP_URL}/loja?ref=${afiliado.ref_code}`
  const loja = afiliado.lojistas as { nome: string } | null

  return (
    <div style={{ minHeight: '100vh', background: '#0c0b0a', color: '#f5f3f0', fontFamily: 'var(--sans)' }}>
      {/* Header */}
      <header style={{
        background: '#111010', borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          maxWidth: '896px', margin: '0 auto', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.125rem', color: '#f5f3f0', fontWeight: 400 }}>
              BongiaTech
            </h1>
            {loja && <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300 }}>Afiliado de {loja.nome}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>{afiliado.nome}</p>
            <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300 }}>{afiliado.email}</p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Seu link */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>Seu link de afiliado</h2>
          <CopiarLink link={linkAfiliado} refCode={afiliado.ref_code} />
        </div>

        {/* Cards de métricas */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '1.5rem',
        }}>
          {[
            {
              label: 'Cliques no link',
              value: String(afiliado.total_cliques),
              icon: MousePointerClick,
            },
            {
              label: 'Vendas geradas',
              value: String(vendas?.length || 0),
              icon: ShoppingBag,
            },
            {
              label: 'A receber',
              value: formatCurrency(afiliado.saldo),
              icon: TrendingUp,
            },
            {
              label: 'Total recebido',
              value: formatCurrency(totalRecebido),
              icon: DollarSign,
            },
          ].map((card) => (
            <div key={card.label} style={{ background: '#111010', padding: '1.5rem' }}>
              <card.icon style={{ width: '15px', height: '15px', color: '#6b6560', marginBottom: '0.75rem' }} />
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: '#f5f3f0', marginBottom: '4px' }}>{card.value}</p>
              <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300 }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Histórico de vendas */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>Minhas vendas</h2>
          </div>
          {!vendas || vendas.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>
              Nenhuma venda rastreada ainda. Compartilhe seu link para começar!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Data', 'Valor do pedido', 'Sua comissão', 'Status'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left',
                      fontSize: '10px', fontWeight: 400, color: '#4a4440',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontWeight: 300 }}>{formatDateTime(v.criado_em)}</td>
                    <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{formatCurrency(v.valor_pedido)}</td>
                    <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{formatCurrency(v.valor_comissao)}</td>
                    <td style={{ padding: '12px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 8px', fontSize: '11px', fontWeight: 400,
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: v.status === 'pago' ? '#f5f3f0' : v.status === 'confirmado' ? '#6b6560' : '#d97706',
                      }}>
                        {v.status === 'pago' ? 'Pago' : v.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Histórico de pagamentos recebidos */}
        {pagamentosAfiliado && pagamentosAfiliado.length > 0 && (
          <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>Pagamentos recebidos</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Data', 'Valor recebido'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left',
                      fontSize: '10px', fontWeight: 400, color: '#4a4440',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagamentosAfiliado.map((p) => (
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

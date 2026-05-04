import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: '#d97706' },
  confirmado: { label: 'Confirmado', color: '#6b6560' },
  pago: { label: 'Pago', color: '#f5f3f0' },
  cancelado: { label: 'Cancelado', color: '#4a4440' },
}

export default async function VendasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vendas } = await supabase
    .from('vendas')
    .select('*, afiliados(nome, email)')
    .eq('lojista_id', user!.id)
    .order('criado_em', { ascending: false })
    .limit(200)

  const total = vendas?.reduce((s, v) => s + v.valor_pedido, 0) || 0
  const totalComissoes = vendas?.reduce((s, v) => s + v.valor_comissao, 0) || 0

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Vendas</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>
          {vendas?.length || 0} vendas · Total em vendas: {formatCurrency(total)} · Comissões: {formatCurrency(totalComissoes)}
        </p>
      </div>

      <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)' }}>
        {!vendas || vendas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b6560' }}>
            <p style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0', marginBottom: '4px' }}>Nenhuma venda rastreada ainda</p>
            <p style={{ fontSize: '13px', fontWeight: 300 }}>As vendas aparecerão aqui quando alguém comprar pelo link de um afiliado.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Data', 'Afiliado', 'Pedido ID', 'Valor do pedido', 'Comissão', 'Status'].map((h) => (
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
                {vendas.map((v) => {
                  const status = STATUS_LABEL[v.status] || STATUS_LABEL.pendente
                  const afiliado = v.afiliados as { nome: string } | null
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', whiteSpace: 'nowrap', fontWeight: 300 }}>
                        {formatDateTime(v.criado_em)}
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 400, color: '#f5f3f0' }}>
                        {afiliado?.nome || '—'}
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '12px', color: '#6b6560', fontFamily: 'monospace', fontWeight: 300 }}>
                        #{v.pedido_id}
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>
                        {formatCurrency(v.valor_pedido)}
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>
                        {formatCurrency(v.valor_comissao)}
                      </td>
                      <td style={{ padding: '12px 24px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '2px 8px', fontSize: '11px', fontWeight: 400,
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: status.color,
                        }}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

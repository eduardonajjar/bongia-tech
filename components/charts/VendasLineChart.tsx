'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export interface DiaVenda {
  dia: string       // ex: "01/05"
  vendas: number    // valor em R$
  comissoes: number
  pedidos: number
}

interface Props {
  dados: DiaVenda[]
  mostrarComissao?: boolean
}

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#111010',
      border: '1px solid rgba(255,255,255,0.10)',
      padding: '10px 14px',
      fontSize: '12px',
      color: '#f5f3f0',
    }}>
      <p style={{ color: '#6b6560', marginBottom: '6px', fontWeight: 300 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: '2px' }}>
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function VendasLineChart({ dados, mostrarComissao = true }: Props) {
  if (!dados || dados.length === 0) {
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4440', fontSize: '12px', fontWeight: 300 }}>
        Sem vendas no período
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={dados} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f5f3f0" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#f5f3f0" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradComissao" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d97706" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 10, fill: '#4a4440', fontWeight: 300 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#4a4440', fontWeight: 300 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${v}`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="vendas"
          name="Vendas"
          stroke="#f5f3f0"
          strokeWidth={1.5}
          fill="url(#gradVendas)"
          dot={false}
          activeDot={{ r: 3, fill: '#f5f3f0' }}
        />
        {mostrarComissao && (
          <Area
            type="monotone"
            dataKey="comissoes"
            name="Comissões"
            stroke="#d97706"
            strokeWidth={1.5}
            fill="url(#gradComissao)"
            dot={false}
            activeDot={{ r: 3, fill: '#d97706' }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

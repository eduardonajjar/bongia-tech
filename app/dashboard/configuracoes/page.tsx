'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle } from 'lucide-react'

interface Config {
  comissao_padrao: number
  janela_atribuicao_dias: number
}

const inputStyle: React.CSSProperties = {
  width: '128px', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', color: '#f5f3f0',
  padding: '8px 12px', fontSize: '13px', outline: 'none',
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Config>({ comissao_padrao: 10, janela_atribuicao_dias: 30 })
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('lojistas')
        .select('comissao_padrao, janela_atribuicao_dias, plano, trial_ate')
        .eq('id', user.id)
        .single()

      if (data) {
        setConfig({
          comissao_padrao: data.comissao_padrao,
          janela_atribuicao_dias: data.janela_atribuicao_dias,
        })
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('lojistas')
      .update(config)
      .eq('id', user.id)

    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  if (carregando) return <div style={{ padding: '2rem', color: '#6b6560', fontSize: '13px', fontWeight: 300 }}>Carregando...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#f5f3f0', fontFamily: 'var(--serif)' }}>Configurações</h1>
        <p style={{ color: '#6b6560', fontSize: '12px', marginTop: '4px', fontWeight: 300 }}>Regras do seu programa de afiliados</p>
      </div>

      <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '4px' }}>
              Comissão padrão (%)
            </label>
            <p style={{ fontSize: '12px', color: '#4a4440', marginBottom: '10px', fontWeight: 300 }}>
              Aplicada a afiliados sem comissão personalizada
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={config.comissao_padrao}
                onChange={(e) => setConfig((c) => ({ ...c, comissao_padrao: parseFloat(e.target.value) }))}
                style={inputStyle}
              />
              <span style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>% por venda</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '4px' }}>
              Janela de atribuição (dias)
            </label>
            <p style={{ fontSize: '12px', color: '#4a4440', marginBottom: '10px', fontWeight: 300 }}>
              Quantos dias após o clique a venda ainda é creditada ao afiliado
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="1"
                max="365"
                value={config.janela_atribuicao_dias}
                onChange={(e) => setConfig((c) => ({ ...c, janela_atribuicao_dias: parseInt(e.target.value) }))}
                style={inputStyle}
              />
              <span style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>dias (padrão: 30)</span>
            </div>
          </div>
        </div>

        {/* Plano */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1rem' }}>Plano atual</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { id: 'starter', label: 'Starter', preco: 'R$149/mês', limite: 'Até 50 afiliados' },
              { id: 'pro', label: 'Pro', preco: 'R$349/mês', limite: 'Afiliados ilimitados' },
            ].map((plano) => (
              <div
                key={plano.id}
                style={{
                  border: '1px solid rgba(124,58,237,0.3)',
                  background: 'rgba(124,58,237,0.06)',
                  padding: '1rem',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#f5f3f0' }}>{plano.label}</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: '#7c3aed', marginTop: '4px' }}>{plano.preco}</p>
                <p style={{ fontSize: '12px', color: '#6b6560', marginTop: '4px', fontWeight: 300 }}>{plano.limite}</p>
                <p style={{ fontSize: '11px', color: '#4a4440', marginTop: '6px', fontWeight: 300 }}>+ 3% sobre comissões pagas</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#4a4440', marginTop: '1rem', fontWeight: 300 }}>
            Para alterar seu plano, entre em contato: suporte@bongiatech.com.br
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            disabled={salvando}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f5f3f0', color: '#0c0b0a',
              padding: '10px 24px', fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer', opacity: salvando ? 0.6 : 1,
            }}
          >
            <Save style={{ width: '14px', height: '14px' }} />
            {salvando ? 'Salvando...' : 'Salvar configurações'}
          </button>
          {salvo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '13px', fontWeight: 300 }}>
              <CheckCircle style={{ width: '14px', height: '14px' }} />
              Salvo com sucesso!
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

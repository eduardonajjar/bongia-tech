import Link from 'next/link'
import ParticleField from '@/components/ParticleField'

// SVG chart mockup - area chart crescente (30 dias)
function ChartMockup() {
  const W = 800, H = 140
  const points = [3,6,5,10,9,14,12,18,16,22,20,26,24,30,35,33,40,38,45,50,48,55,60,58,65,72,70,78,85,95]
  const xs = points.map((_, i) => (i / (points.length - 1)) * W)
  const ys = points.map(v => H - (v / 100) * H * 0.9 - H * 0.05)
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const areaPath = linePath + ` L${W},${H} L0,${H} Z`

  // Comissão (10% da linha principal)
  const ys2 = points.map(v => H - (v * 0.1 / 10) * H * 0.9 - H * 0.05)
  const linePath2 = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys2[i].toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <path d={linePath2} fill="none" stroke="rgba(217,119,6,0.8)" strokeWidth="1.5" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export default function Home() {
  const textPrimary = '#ffffff'
  const textSecondary = '#a09890'
  const textMuted = '#6b6560'
  const boxBg = '#161514'
  const border = 'rgba(255,255,255,0.09)'

  return (
    <main style={{ background: '#0c0b0a', color: textPrimary, minHeight: '100vh', fontFamily: 'var(--sans)' }}>

      {/* Animações CSS globais */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-badge   { animation: fade-up 0.6s ease both; }
        .hero-heading { animation: fade-up 0.6s 0.1s ease both; }
        .hero-sub     { animation: fade-up 0.6s 0.2s ease both; }
        .hero-ctas    { animation: fade-up 0.6s 0.3s ease both; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: `1px solid ${border}`,
        background: 'rgba(12,11,10,0.95)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '56px',
      }}>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.25rem', color: textPrimary }}>
          BongiaTech
        </span>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#como-funciona" style={{ fontSize: '13px', color: textMuted, textDecoration: 'none', fontWeight: 300 }}>Como funciona</a>
          <a href="#diferenciais" style={{ fontSize: '13px', color: textMuted, textDecoration: 'none', fontWeight: 300 }}>Diferenciais</a>
          <a href="#precos" style={{ fontSize: '13px', color: textMuted, textDecoration: 'none', fontWeight: 300 }}>Preços</a>
          <Link href="/login" style={{ fontSize: '13px', color: textMuted, textDecoration: 'none', fontWeight: 300 }}>Entrar</Link>
          <Link href="/registro" style={{
            fontSize: '13px', color: '#0c0b0a', background: textPrimary,
            padding: '6px 16px', textDecoration: 'none', fontWeight: 500,
          }}>
            Instalar na Nuvemshop
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 2rem 5rem',
        paddingTop: '56px',
      }}>
        {/* Glow ambiente estático atrás das partículas */}
        <div style={{
          position: 'absolute', top: '15%', left: '-8%',
          width: '700px', height: '550px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(217,119,6,0.13) 0%, rgba(217,119,6,0.04) 50%, transparent 75%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Campo de partículas âmbar */}
        <ParticleField />

        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '760px' }}>
          {/* Badge Nuvemshop */}
          <div className="hero-badge" style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              border: `1px solid rgba(255,255,255,0.12)`,
              padding: '5px 12px',
              fontSize: '11px', fontWeight: 400, color: textSecondary, letterSpacing: '0.06em',
              background: 'rgba(255,255,255,0.03)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Integração nativa Nuvemshop
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              border: `1px solid rgba(255,255,255,0.12)`,
              padding: '5px 12px',
              fontSize: '11px', fontWeight: 400, color: textSecondary, letterSpacing: '0.06em',
              background: 'rgba(255,255,255,0.03)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Checkout V3 Ready
            </div>
          </div>

          <h1 className="hero-heading" style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(2.75rem, 6vw, 4.75rem)',
            lineHeight: 1.05, fontWeight: 400, marginBottom: '1.5rem', color: textPrimary,
          }}>
            Crie seu programa de afiliados<br />
            <em>na Nuvemshop em minutos.</em>
          </h1>
          <p className="hero-sub" style={{ fontSize: '1.125rem', color: textSecondary, maxWidth: '560px', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.65 }}>
            Convide influenciadores, parceiros e clientes para vender sua loja.
            O Bongia rastreia cada venda automaticamente e calcula as comissões —
            sem planilha, sem gambiarra.
          </p>
          <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/registro" style={{
              background: textPrimary, color: '#0c0b0a',
              padding: '13px 28px', textDecoration: 'none',
              fontSize: '14px', fontWeight: 500,
            }}>
              Instalar na Nuvemshop — grátis por 30 dias
            </Link>
            <a href="#como-funciona" style={{ fontSize: '14px', color: textSecondary, textDecoration: 'none', fontWeight: 300 }}>
              Ver como funciona →
            </a>
          </div>
          <p style={{ fontSize: '12px', color: textMuted, marginTop: '1rem', fontWeight: 300 }}>
            Sem cartão de crédito. Instalação em 1 clique. Cancela quando quiser.
          </p>
        </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { value: '1 clique', label: 'para instalar na Nuvemshop' },
            { value: '5 minutos', label: 'para configurar tudo' },
            { value: '30 dias', label: 'de janela de atribuição' },
            { value: '0 planilhas', label: 'necessárias para operar' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '2.5rem 2rem',
              borderRight: i < 3 ? `1px solid ${border}` : 'none',
            }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '2.25rem', color: textPrimary, marginBottom: '0.5rem' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: textSecondary, fontWeight: 300 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problema */}
      <section id="problema" style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 400 }}>
              O problema
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: textPrimary, lineHeight: 1.2 }}>
              Controlar afiliados no manual vira caos rapidamente.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <p style={{ fontSize: '15px', color: textSecondary, fontWeight: 300, lineHeight: 1.7 }}>
              Quando o programa de afiliados cresce, os problemas aparecem: vendas não rastreadas,
              comissão calculada errado, afiliado cobrando print, planilhas desatualizadas.
              E quando você tenta usar outra ferramenta, funciona uma semana — depois para de rastrear e você recomeça do zero.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: `1px solid ${border}`, background: boxBg }}>
          {[
            { title: 'Rastreamento no escuro', desc: 'Você pede para o afiliado mandar print. Ele esquece. A venda some e ninguém consegue provar nada.' },
            { title: 'Planilha que não fecha', desc: 'Horas tentando reconciliar quem vendeu o quê. Sempre sobra dúvida no final do mês.' },
            { title: '"Quanto recebi esse mês?"', desc: 'Essa mensagem chega toda semana de cada afiliado. No WhatsApp. De madrugada.' },
            { title: 'Outras ferramentas param de funcionar', desc: 'Você tenta uma solução, funciona uma semana e para de rastrear. Recomeça do zero. O problema é técnico — e a maioria não resolve.' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '2rem',
              borderRight: i < 3 ? `1px solid ${border}` : 'none',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: textPrimary, marginBottom: '0.75rem' }}>{item.title}</p>
              <p style={{ fontSize: '13px', color: textSecondary, fontWeight: 300, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solução — dashboard mockup */}
      <section id="solucao" style={{ borderTop: `1px solid ${border}`, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '3.5rem' }}>
            <div>
              <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 400 }}>
                A solução
              </p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: textPrimary, lineHeight: 1.2 }}>
                Um sistema que opera sozinho enquanto você vende.
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <p style={{ fontSize: '15px', color: textSecondary, fontWeight: 300, lineHeight: 1.7 }}>
                Cada afiliado recebe um link exclusivo. Cada venda é atribuída automaticamente.
                Seus afiliados acompanham cliques, pedidos e comissões em tempo real — sem precisar te chamar no WhatsApp.
              </p>
            </div>
          </div>

          {/* Dashboard mockup completo */}
          <div style={{ background: boxBg, border: `1px solid ${border}`, padding: '2rem' }}>

            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: border, marginBottom: '1.5rem' }}>
              {[
                { label: 'Vendas via afiliados', value: 'R$47.320', sub: '↑ 23% vs mês anterior' },
                { label: 'Comissões geradas', value: 'R$4.732', sub: 'Total acumulado' },
                { label: 'Afiliados ativos', value: '23', sub: 'Com link ativo' },
                { label: 'A pagar', value: 'R$2.180', sub: 'Saldo pendente total' },
              ].map((card, i) => (
                <div key={i} style={{ background: boxBg, padding: '1.5rem' }}>
                  <p style={{ fontSize: '10px', color: textMuted, fontWeight: 400, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {card.label}
                  </p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '1.875rem', color: textPrimary, marginBottom: '0.25rem' }}>{card.value}</p>
                  <p style={{ fontSize: '11px', color: textMuted, fontWeight: 300 }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Gráfico */}
            <div style={{ border: `1px solid ${border}`, marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 400 }}>Vendas dos últimos 30 dias</span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: textSecondary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '20px', height: '1.5px', background: 'rgba(255,255,255,0.7)', display: 'inline-block' }} />
                    Vendas
                  </span>
                  <span style={{ fontSize: '11px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '20px', height: '1.5px', background: '#d97706', display: 'inline-block' }} />
                    Comissões
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.5rem', height: '140px' }}>
                <ChartMockup />
              </div>
            </div>

            {/* Tabela de afiliados completa */}
            <div style={{ border: `1px solid ${border}` }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 400 }}>Afiliados</span>
                <span style={{ fontSize: '12px', color: textMuted }}>Ver todos →</span>
              </div>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 80px',
                padding: '0.6rem 1.5rem',
                borderBottom: `1px solid ${border}`,
              }}>
                {['Nome', 'Vendas geradas', 'Comissão', 'A pagar', 'Link', 'Status'].map(h => (
                  <span key={h} style={{ fontSize: '10px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</span>
                ))}
              </div>
              {[
                { nome: 'João Silva', vendas: 'R$12.400', comissao: 'R$1.240', pagar: 'R$620' },
                { nome: 'Maria Costa', vendas: 'R$9.800', comissao: 'R$980', pagar: 'R$490' },
                { nome: 'Pedro Rocha', vendas: 'R$8.200', comissao: 'R$820', pagar: 'R$410' },
                { nome: 'Ana Ferreira', vendas: 'R$6.100', comissao: 'R$610', pagar: 'R$305' },
              ].map((a, i, arr) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 80px',
                  padding: '0.85rem 1.5rem',
                  borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 400 }}>{a.nome}</span>
                  <span style={{ fontSize: '13px', color: textSecondary }}>{a.vendas}</span>
                  <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>{a.comissao}</span>
                  <span style={{ fontSize: '13px', color: '#d97706', fontWeight: 500 }}>{a.pagar}</span>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11px', color: textSecondary, background: 'none',
                    border: `1px solid ${border}`, padding: '4px 8px', cursor: 'pointer',
                  }}>
                    <CopyIcon /> Copiar link
                  </button>
                  <span style={{
                    fontSize: '11px', color: textPrimary,
                    border: `1px solid ${border}`, padding: '3px 8px',
                    display: 'inline-block', textAlign: 'center',
                  }}>
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" style={{ borderTop: `1px solid ${border}`, padding: '6rem 2rem', background: '#111010' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: '#8a7e78', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3rem', fontWeight: 500 }}>
            Como funciona
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1px solid ${border}`, background: '#181716' }}>
            {[
              {
                n: '01',
                title: 'Instala em 1 clique na Nuvemshop',
                desc: 'Plug & Play. Nenhuma linha de código. Nenhuma configuração técnica. Você instala pelo painel da Nuvemshop e já está pronto para operar.',
              },
              {
                n: '02',
                title: 'Cadastra seus afiliados',
                desc: 'Nome, email e % de comissão. O sistema gera um link rastreável exclusivo para cada um. O afiliado compartilha onde quiser.',
              },
              {
                n: '03',
                title: 'Cada venda é atribuída automaticamente',
                desc: 'Quando alguém compra pelo link do João, a venda aparece atribuída ao João — com produto, valor e comissão calculada. Você só acompanha.',
              },
            ].map((step, i) => (
              <div key={i} style={{
                padding: '2.5rem 2rem',
                borderRight: i < 2 ? `1px solid ${border}` : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--serif)', fontSize: '2.5rem',
                  color: 'rgba(217,119,6,0.35)',
                  marginBottom: '1.5rem', fontWeight: 400,
                }}>
                  {step.n}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: textPrimary, marginBottom: '0.75rem' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: textSecondary, fontWeight: 300, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais — Checkout V3 + Plug & Play */}
      <section id="diferenciais" style={{ borderTop: `1px solid ${border}`, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3rem', fontWeight: 400 }}>
            Por que o Bongia
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: border }}>
            {/* Checkout V3 */}
            <div style={{ background: boxBg, padding: '3rem' }}>
              <div style={{
                display: 'inline-block', border: `1px solid rgba(34,197,94,0.3)`,
                padding: '4px 10px', marginBottom: '1.5rem',
                fontSize: '10px', color: '#22c55e', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Tecnologia própria
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: textPrimary, fontWeight: 400, lineHeight: 1.2, marginBottom: '1rem' }}>
                Cada venda é capturada — mesmo as que outras ferramentas perdem.
              </h3>
              <p style={{ fontSize: '14px', color: textSecondary, fontWeight: 300, lineHeight: 1.7, marginBottom: '1.5rem' }}>
                A maioria das ferramentas perde o rastreamento na etapa de finalização da compra. O Bongia usa uma tecnologia própria para manter o vínculo do afiliado até o pagamento ser confirmado. Resultado: menos venda perdida, comissão sempre correta.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Rastreamento preservado até a confirmação do pagamento', 'Sem venda perdida por falha técnica', 'Funciona onde outras ferramentas falham'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22c55e', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '13px', color: textSecondary, fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plug & Play */}
            <div style={{ background: boxBg, padding: '3rem' }}>
              <div style={{
                display: 'inline-block', border: `1px solid rgba(255,255,255,0.12)`,
                padding: '4px 10px', marginBottom: '1.5rem',
                fontSize: '10px', color: textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Nativo Nuvemshop
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: textPrimary, fontWeight: 400, lineHeight: 1.2, marginBottom: '1rem' }}>
                Instalação em 1 clique. Sem código. Sem técnico.
              </h3>
              <p style={{ fontSize: '14px', color: textSecondary, fontWeight: 300, lineHeight: 1.7, marginBottom: '1.5rem' }}>
                O Bongia é um app nativo da Nuvemshop. Você instala diretamente pelo painel da sua loja, sem precisar de desenvolvedor, sem mexer em código, sem configuração técnica. Em menos de 5 minutos seu programa de afiliados está no ar.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Instalação plug & play pelo painel Nuvemshop', 'Rastreamento automático ativado na instalação', 'Script injetado automaticamente em todas as páginas'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22c55e', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '13px', color: textSecondary, fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Afiliado feliz */}
            <div style={{ background: boxBg, padding: '3rem', borderTop: `1px solid ${border}` }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: textPrimary, fontWeight: 400, lineHeight: 1.2, marginBottom: '1rem' }}>
                Afiliado com painel próprio vende mais.
              </h3>
              <p style={{ fontSize: '14px', color: textSecondary, fontWeight: 300, lineHeight: 1.7 }}>
                Cada afiliado tem acesso a um painel em tempo real com seus cliques, pedidos e comissões. Sem precisar te chamar. Sem cobrar print. Mais confiança, mais motivação, mais vendas.
              </p>
            </div>

            {/* Sem planilha */}
            <div style={{ background: boxBg, padding: '3rem', borderTop: `1px solid ${border}` }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: textPrimary, fontWeight: 400, lineHeight: 1.2, marginBottom: '1rem' }}>
                Zero operação manual.
              </h3>
              <p style={{ fontSize: '14px', color: textSecondary, fontWeight: 300, lineHeight: 1.7 }}>
                Nenhuma planilha. Nenhum controle manual. Nenhuma discussão sobre qual venda pertence a quem. O sistema faz tudo — você só acompanha o painel e decide quando pagar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" style={{ borderTop: `1px solid ${border}`, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 400 }}>
              Preços
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: textPrimary }}>
              Comece grátis. Pague só quando escalar.
            </h2>
            <p style={{ fontSize: '14px', color: textSecondary, marginTop: '0.75rem', fontWeight: 300 }}>Sem cartão. Sem surpresa. Cancela quando quiser.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: border, maxWidth: '1000px' }}>

            {/* Grátis */}
            <div style={{ background: boxBg, padding: '2.5rem' }}>
              <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 400 }}>Grátis</p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '3rem', color: textPrimary, marginBottom: '0.25rem' }}>R$0</p>
              <p style={{ fontSize: '12px', color: textMuted, marginBottom: '2rem', fontWeight: 300 }}>Para sempre — sem cartão</p>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: '1.5rem', marginBottom: '2rem' }}>
                {[
                  'Até 3 afiliados',
                  'Rastreamento automático',
                  'Dashboard do lojista',
                  'Portal do afiliado',
                  'Integração Nuvemshop',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#22c55e', fontSize: '13px', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '13px', color: textSecondary, fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/registro" style={{
                display: 'block', textAlign: 'center', background: 'transparent',
                color: textPrimary, border: `1px solid ${border}`,
                padding: '13px', textDecoration: 'none', fontSize: '14px', fontWeight: 400,
              }}>
                Instalar grátis
              </Link>
            </div>

            {/* Starter */}
            <div style={{ background: boxBg, padding: '2.5rem', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                fontSize: '10px', color: '#0c0b0a', background: textPrimary,
                padding: '3px 8px', fontWeight: 500,
              }}>POPULAR</div>
              <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 400 }}>Starter</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '3rem', color: textPrimary }}>R$149</p>
                <p style={{ fontSize: '13px', color: textMuted, fontWeight: 300 }}>/mês</p>
              </div>
              <p style={{ fontSize: '12px', color: textMuted, marginBottom: '2rem', fontWeight: 300 }}>30 dias grátis para testar</p>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: '1.5rem', marginBottom: '2rem' }}>
                {[
                  'Até 50 afiliados',
                  'Rastreamento automático',
                  'Dashboard em tempo real',
                  'Portal do afiliado com login próprio',
                  'Emails automáticos para afiliados',
                  'Exportar CSV para pagamento',
                  'Integração nativa Nuvemshop',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#22c55e', fontSize: '13px', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '13px', color: textSecondary, fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/registro" style={{
                display: 'block', textAlign: 'center',
                background: textPrimary, color: '#0c0b0a',
                padding: '14px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              }}>
                Começar 30 dias grátis
              </Link>
              <p style={{ textAlign: 'center', fontSize: '11px', color: textMuted, marginTop: '0.75rem', fontWeight: 300 }}>
                Sem cartão. Cancela em 1 clique.
              </p>
            </div>

            {/* Pro */}
            <div style={{ background: boxBg, padding: '2.5rem' }}>
              <p style={{ fontSize: '11px', color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 400 }}>Pro</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '3rem', color: textPrimary }}>R$299</p>
                <p style={{ fontSize: '13px', color: textMuted, fontWeight: 300 }}>/mês</p>
              </div>
              <p style={{ fontSize: '12px', color: textMuted, marginBottom: '2rem', fontWeight: 300 }}>30 dias grátis para testar</p>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: '1.5rem', marginBottom: '2rem' }}>
                {[
                  'Afiliados ilimitados',
                  'Rastreamento automático',
                  'Dashboard em tempo real',
                  'Portal do afiliado com login próprio',
                  'Emails automáticos para afiliados',
                  'Exportar CSV para pagamento',
                  'PIX automático para afiliados — em breve',
                  'Relatórios avançados — em breve',
                  'Integração nativa Nuvemshop',
                ].map((f, i) => {
                  const emBreve = f.includes('em breve')
                  return (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: emBreve ? '#d97706' : '#22c55e', fontSize: '13px', flexShrink: 0 }}>
                        {emBreve ? '◎' : '✓'}
                      </span>
                      <span style={{ fontSize: '13px', color: emBreve ? textMuted : textSecondary, fontWeight: 300 }}>{f}</span>
                    </div>
                  )
                })}
              </div>
              <Link href="/registro" style={{
                display: 'block', textAlign: 'center', background: 'transparent',
                color: textPrimary, border: `1px solid rgba(255,255,255,0.2)`,
                padding: '13px', textDecoration: 'none', fontSize: '14px', fontWeight: 400,
              }}>
                Começar 30 dias grátis
              </Link>
              <p style={{ textAlign: 'center', fontSize: '11px', color: textMuted, marginTop: '0.75rem', fontWeight: 300 }}>
                Sem cartão. Cancela em 1 clique.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ borderTop: `1px solid ${border}`, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 400, color: textPrimary, marginBottom: '1.25rem', maxWidth: '600px' }}>
            Pare de controlar afiliados no Excel.
          </h2>
          <p style={{ fontSize: '15px', color: textSecondary, marginBottom: '2.5rem', fontWeight: 300 }}>
            Instale o Bongia na sua loja Nuvemshop e acompanhe cada venda automaticamente.
          </p>
          <Link href="/registro" style={{
            background: textPrimary, color: '#0c0b0a',
            padding: '14px 32px', textDecoration: 'none',
            fontSize: '14px', fontWeight: 500, display: 'inline-block',
          }}>
            Começar grátis agora
          </Link>
          <p style={{ fontSize: '12px', color: textMuted, marginTop: '1rem', fontWeight: 300 }}>
            30 dias grátis · Sem cartão · Instalação em 1 clique na Nuvemshop
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: textMuted, fontSize: '14px' }}>BongiaTech</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/privacidade" style={{ fontSize: '12px', color: textMuted, fontWeight: 300, textDecoration: 'none' }}>Política de privacidade</Link>
          <span style={{ fontSize: '12px', color: textMuted, fontWeight: 300 }}>© 2026 · suporte@bongiatech.com.br</span>
        </div>
      </footer>
    </main>
  )
}

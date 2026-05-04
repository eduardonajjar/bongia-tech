import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ background: '#0c0b0a', color: '#f5f3f0', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#0c0b0a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '56px',
      }}>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.25rem', color: '#f5f3f0' }}>
          BongiaTech
        </span>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#problema" style={{ fontSize: '13px', color: '#6b6560', textDecoration: 'none', fontWeight: 300 }}>Problema</a>
          <a href="#solucao" style={{ fontSize: '13px', color: '#6b6560', textDecoration: 'none', fontWeight: 300 }}>Solução</a>
          <a href="#precos" style={{ fontSize: '13px', color: '#6b6560', textDecoration: 'none', fontWeight: 300 }}>Preços</a>
          <Link href="/login" style={{ fontSize: '13px', color: '#6b6560', textDecoration: 'none', fontWeight: 300 }}>Entrar</Link>
          <Link href="/registro" style={{
            fontSize: '13px', color: '#0c0b0a', background: '#f5f3f0',
            padding: '6px 16px', textDecoration: 'none', fontWeight: 500,
          }}>
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 2rem 5rem',
        maxWidth: '1200px', margin: '0 auto',
        paddingTop: '56px',
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{
            display: 'inline-block',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '4px 12px', marginBottom: '2rem',
            fontSize: '11px', fontWeight: 400, color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Para lojistas Nuvemshop com afiliados
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            lineHeight: 1.05, fontWeight: 400, marginBottom: '1.5rem', color: '#f5f3f0',
          }}>
            Chega de planilha para<br /><em>gerenciar afiliados.</em>
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b6560', maxWidth: '520px', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.6 }}>
            Rastreie quem vendeu o quê, mostre para cada afiliado quanto ganhou, e saiba exatamente o que deve para cada um. Tudo automático.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/registro" style={{
              background: '#f5f3f0', color: '#0c0b0a',
              padding: '12px 28px', textDecoration: 'none',
              fontSize: '14px', fontWeight: 500,
            }}>
              Começar grátis por 14 dias — sem cartão
            </Link>
            <a href="#solucao" style={{ fontSize: '14px', color: '#6b6560', textDecoration: 'none', fontWeight: 300 }}>
              Ver como funciona →
            </a>
          </div>
          <p style={{ fontSize: '12px', color: '#4a4440', marginTop: '1rem', fontWeight: 300 }}>
            14 dias grátis. Sem cartão. Cancela quando quiser.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { value: '1 clique', label: 'para copiar o link do afiliado' },
            { value: '30 dias', label: 'de cookie de atribuição' },
            { value: '0 planilhas', label: 'necessárias para operar' },
            { value: '5 min', label: 'para configurar tudo' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '2.5rem 2rem',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '2.25rem', color: '#f5f3f0', marginBottom: '0.5rem' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problema */}
      <section id="problema" style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 400 }}>
              O problema
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: '#f5f3f0', lineHeight: 1.2 }}>
              Gerenciar afiliados manualmente é um caos que escala mal.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <p style={{ fontSize: '15px', color: '#6b6560', fontWeight: 300, lineHeight: 1.7 }}>
              Lojistas com 5, 10, 20 afiliados vivem no WhatsApp, em planilhas desatualizadas e em discussões sobre qual venda pertence a quem. Isso não é gestão — é apagação de incêndio.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { title: 'Rastreamento manual', desc: 'Você pede para o afiliado mandar print da venda. Ele esquece. A venda some.' },
            { title: 'Planilha que não fecha', desc: 'Cada mês você passa horas tentando reconciliar quem vendeu o quê com os pedidos da loja.' },
            { title: 'WhatsApp do caos', desc: '"Quanto eu recebi esse mês?" Essa pergunta chega toda semana de cada afiliado.' },
            { title: 'Pagamento no escuro', desc: 'Você não sabe ao certo quanto deve para quem. Paga por estimativa. Alguém sempre sai insatisfeito.' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '2rem',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#f5f3f0', marginBottom: '0.75rem' }}>{item.title}</p>
              <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solução */}
      <section id="solucao" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 400 }}>
                A solução
              </p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: '#f5f3f0', lineHeight: 1.2 }}>
                Um sistema que opera sozinho enquanto você vende.
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <p style={{ fontSize: '15px', color: '#6b6560', fontWeight: 300, lineHeight: 1.7 }}>
                Cada afiliado recebe um link rastreável. Cada venda é atribuída automaticamente. Cada afiliado vê seu saldo em tempo real. Você só decide quando e quanto paga.
              </p>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div style={{
            background: '#111010', border: '1px solid rgba(255,255,255,0.07)',
            padding: '2rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '2rem' }}>
              {[
                { label: 'Vendas via afiliados', value: 'R$14.820' },
                { label: 'Comissões geradas', value: 'R$1.482' },
                { label: 'Afiliados ativos', value: '12' },
                { label: 'A pagar', value: 'R$890' },
              ].map((card, i) => (
                <div key={i} style={{ background: '#111010', padding: '1.5rem' }}>
                  <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 400, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {card.label}
                  </p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', color: '#f5f3f0' }}>{card.value}</p>
                </div>
              ))}
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#f5f3f0', fontWeight: 400 }}>Top Afiliados</span>
                <span style={{ fontSize: '12px', color: '#6b6560' }}>Ver todos →</span>
              </div>
              {[
                { nome: 'João Silva', vendas: 'R$4.200', comissao: 'R$420', status: 'Ativo' },
                { nome: 'Maria Costa', vendas: 'R$3.100', comissao: 'R$310', status: 'Ativo' },
                { nome: 'Pedro Rocha', vendas: 'R$2.800', comissao: 'R$280', status: 'Ativo' },
              ].map((a, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '0.875rem 1.5rem',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{ fontSize: '13px', color: '#f5f3f0', fontWeight: 400 }}>{a.nome}</span>
                  <span style={{ fontSize: '13px', color: '#6b6560' }}>{a.vendas}</span>
                  <span style={{ fontSize: '13px', color: '#f5f3f0' }}>{a.comissao}</span>
                  <span style={{ fontSize: '11px', color: '#6b6560', border: '1px solid rgba(255,255,255,0.07)', padding: '2px 8px', alignSelf: 'center', display: 'inline-block' }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3rem', fontWeight: 400 }}>
            Como funciona
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              {
                n: '01',
                title: 'Adicione seus afiliados',
                desc: 'Cadastre nome, email e porcentagem de comissão. O sistema gera um link rastreável único para cada um.',
              },
              {
                n: '02',
                title: 'Afiliado compartilha o link',
                desc: 'No Instagram, TikTok, WhatsApp — onde quiser. O link não tem desconto visível, então não vaza para o Pelando.',
              },
              {
                n: '03',
                title: 'Venda registrada, saldo atualizado',
                desc: 'Quando alguém compra pelo link do João, a venda aparece atribuída ao João. João vê o saldo crescer em tempo real.',
              },
            ].map((step, i) => (
              <div key={i} style={{
                padding: '2.5rem 2rem',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                  {step.n}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#f5f3f0', marginBottom: '0.75rem' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: '11px', color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 400 }}>
              Preços
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 400, color: '#f5f3f0' }}>
              Um plano. Tudo incluído.
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6560', marginTop: '0.75rem', fontWeight: 300 }}>Sem surpresa. Cancela quando quiser.</p>
          </div>

          <div style={{ maxWidth: '384px' }}>
            <div style={{
              background: '#111010',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '2.5rem',
            }}>
              <p style={{ fontSize: '11px', color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 400 }}>
                Plano completo
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '3rem', color: '#f5f3f0' }}>R$97</p>
                <p style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>/mês</p>
              </div>
              <p style={{ fontSize: '12px', color: '#6b6560', marginBottom: '2rem', fontWeight: 300 }}>14 dias grátis — sem cartão</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                {[
                  'Rastreamento por link (cookie 30 dias)',
                  'Painel do lojista em tempo real',
                  'Portal do afiliado com login próprio',
                  'Atribuição automática de vendas',
                  'Histórico completo de comissões',
                  'Exportar CSV para pagamento',
                  'Emails automáticos para afiliados',
                  'Integração nativa com Nuvemshop',
                  'Afiliados ilimitados',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#f5f3f0', fontSize: '13px', flexShrink: 0 }}>—</span>
                    <span style={{ fontSize: '13px', color: '#6b6560', fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/registro" style={{
                display: 'block', textAlign: 'center',
                background: '#f5f3f0', color: '#0c0b0a',
                padding: '14px', textDecoration: 'none',
                fontSize: '14px', fontWeight: 500,
              }}>
                Começar 14 dias grátis
              </Link>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#4a4440', marginTop: '0.75rem', fontWeight: 300 }}>
                Sem cartão de crédito. Cancela em 1 clique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#f5f3f0', marginBottom: '1.5rem' }}>
            Pronto para parar de usar planilha?
          </h2>
          <p style={{ fontSize: '15px', color: '#6b6560', marginBottom: '2.5rem', fontWeight: 300 }}>
            14 dias grátis. Sem cartão. Configure em 5 minutos.
          </p>
          <Link href="/registro" style={{
            background: '#f5f3f0', color: '#0c0b0a',
            padding: '14px 32px', textDecoration: 'none',
            fontSize: '14px', fontWeight: 500, display: 'inline-block',
          }}>
            Começar grátis agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: '#6b6560', fontSize: '14px' }}>BongiaTech</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/privacidade" style={{ fontSize: '12px', color: '#4a4440', fontWeight: 300, textDecoration: 'none' }}>Política de privacidade</Link>
          <span style={{ fontSize: '12px', color: '#4a4440', fontWeight: 300 }}>© 2025 · suporte@bongiatech.com.br</span>
        </div>
      </footer>
    </main>
  )
}

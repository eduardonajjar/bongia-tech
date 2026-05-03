import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900">
          Bongia<span className="text-violet-600">Tech</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
            Entrar
          </Link>
          <Link href="/registro" className="text-sm bg-violet-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          Para lojistas Nuvemshop com afiliados
        </div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Chega de planilha para<br />gerenciar afiliados.
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Rastreie quem vendeu o quê, mostre para cada afiliado quanto ganhou, e saiba exatamente o que deve para cada um. Tudo automático.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/registro"
            className="bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-colors text-base"
          >
            Começar grátis por 14 dias — sem cartão
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">14 dias grátis. Sem cartão. Cancela quando quiser.</p>
      </section>

      {/* 3 benefícios */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                emoji: '📊',
                titulo: 'Sem planilha',
                desc: 'Cada afiliado tem um link rastreável. Você vê em tempo real quem gerou qual venda — sem precisar perguntar para ninguém.',
              },
              {
                emoji: '🔗',
                titulo: 'Afiliado vê tudo em tempo real',
                desc: 'Cada afiliado tem um painel próprio. Ele acessa pelo link que você manda, vê cliques, vendas e saldo. Zero pergunta no WhatsApp.',
              },
              {
                emoji: '✅',
                titulo: 'Você decide quando e quanto paga',
                desc: 'A plataforma mostra exatamente quanto você deve para cada um. Você paga manualmente ou com 1 clique via PIX (plano Pro).',
              },
            ].map((b) => (
              <div key={b.titulo} className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="text-4xl mb-4">{b.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{b.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Como funciona</h2>
        <p className="text-gray-500 text-center mb-14">Do cadastro à primeira venda rastreada em menos de 5 minutos.</p>
        <div className="space-y-6">
          {[
            { n: '1', titulo: 'Adicione seus afiliados', desc: 'Cadastre nome, email e porcentagem de comissão. O sistema gera um link rastreável único para cada um.' },
            { n: '2', titulo: 'Afiliado compartilha o link', desc: 'No Instagram, TikTok, WhatsApp — onde quiser. O link não tem desconto visível, então não vaza para o Pelando.' },
            { n: '3', titulo: 'Venda acontece — você sabe de quem', desc: 'Quando alguém compra pelo link do João, a venda aparece no seu painel atribuída ao João. Automático.' },
            { n: '4', titulo: 'João vê o saldo dele crescendo', desc: 'No painel do afiliado, João acompanha cliques, vendas e quanto tem a receber. Sem perguntar para você.' },
          ].map((p) => (
            <div key={p.n} className="flex gap-6 items-start">
              <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm">
                {p.n}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{p.titulo}</h3>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plano único */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Preço simples, sem surpresa</h2>
          <p className="text-gray-500 text-center mb-12">Um plano só. Tudo incluído. Cancela quando quiser.</p>

          <div className="bg-white rounded-2xl border-2 border-violet-600 p-10 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-violet-600 uppercase tracking-wide mb-2">Plano completo</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-bold text-gray-900">R$97</p>
                  <p className="text-gray-400 mb-1">/mês</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">14 dias grátis — sem cartão</p>
              </div>
              <div className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full border border-violet-200">
                Afiliados ilimitados
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                'Rastreamento por link (cookie 30 dias)',
                'Painel do lojista em tempo real',
                'Portal do afiliado com login próprio',
                'Atribuição automática de vendas',
                'Histórico completo de comissões',
                'Exportar CSV para pagar via PIX',
                'Emails automáticos para afiliados',
                'Integração nativa com Nuvemshop',
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span> {f}
                </div>
              ))}
            </div>

            <Link
              href="/registro"
              className="block text-center bg-violet-600 text-white font-semibold py-4 rounded-xl hover:bg-violet-700 transition-colors text-base"
            >
              Começar 14 dias grátis
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">Sem cartão de crédito. Cancela em 1 clique.</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Pronto para parar de usar planilha?</h2>
        <p className="text-gray-500 mb-8">14 dias grátis. Sem cartão. Configure em 5 minutos.</p>
        <Link
          href="/registro"
          className="bg-violet-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-violet-700 transition-colors text-base inline-block"
        >
          Começar grátis agora
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © 2026 BongiaTech · suporte@bongiatech.com.br
      </footer>
    </main>
  )
}

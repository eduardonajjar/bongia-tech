import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — BongiaTech',
  description: 'Como a BongiaTech coleta, usa e protege seus dados.',
}

export default function PrivacidadePage() {
  return (
    <div style={{ background: '#0c0b0a', minHeight: '100vh', color: '#f5f3f0' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>

        <Link href="/" style={{
          fontSize: '13px', color: '#6b6560', textDecoration: 'none',
          display: 'inline-block', marginBottom: '2rem', fontWeight: 300,
        }}>
          ← Voltar
        </Link>

        <h1 style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic',
          fontSize: '2rem', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.5rem',
        }}>
          Política de Privacidade
        </h1>
        <p style={{ fontSize: '13px', color: '#6b6560', marginBottom: '3rem', fontWeight: 300 }}>
          Última atualização: maio de 2025
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', fontSize: '14px', lineHeight: '1.8', fontWeight: 300, color: '#c4c0bb' }}>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>1. Quem somos</h2>
            <p>
              A <strong style={{ color: '#f5f3f0', fontWeight: 400 }}>BongiaTech</strong> é uma plataforma de gestão de programas de afiliados para lojistas do e-commerce brasileiro,
              operada por Bongia Tech LTDA. Nosso aplicativo integra-se à Nuvemshop para permitir que lojistas
              criem e gerenciem redes de afiliados de forma simples e automatizada.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Contato: <a href="mailto:suporte@bongiatech.com.br" style={{ color: '#6b6560' }}>suporte@bongiatech.com.br</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>2. Dados que coletamos</h2>
            <p><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Lojistas (via Nuvemshop OAuth):</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Nome da loja e e-mail de contato</li>
              <li>ID da loja na Nuvemshop</li>
              <li>Token de acesso à API da Nuvemshop (para leitura de pedidos)</li>
              <li>Dados de uso da plataforma (afiliados, vendas, pagamentos)</li>
            </ul>
            <p style={{ marginTop: '1rem' }}><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Afiliados:</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Nome e e-mail</li>
              <li>Chave PIX para recebimento de comissões</li>
              <li>Histórico de cliques e vendas rastreadas</li>
            </ul>
            <p style={{ marginTop: '1rem' }}><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Compradores (indiretamente):</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Dados de pedidos recebidos via webhook da Nuvemshop (ID do pedido, valor, status)</li>
              <li>Não coletamos dados de pagamento ou cartão de crédito</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>3. Como usamos os dados</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Autenticar lojistas e afiliados na plataforma</li>
              <li>Rastrear vendas e calcular comissões dos afiliados</li>
              <li>Processar pagamentos via PIX para afiliados</li>
              <li>Enviar notificações por e-mail sobre o programa de afiliados</li>
              <li>Gerar relatórios e métricas para os lojistas</li>
              <li>Cumprir obrigações legais, incluindo a LGPD</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins comerciais.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>4. Base legal (LGPD)</h2>
            <p>Tratamos dados pessoais com base nas seguintes hipóteses legais previstas na Lei 13.709/2018:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Execução de contrato</strong> — para prestar os serviços contratados pelo lojista</li>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Consentimento</strong> — para envio de comunicações de marketing</li>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Legítimo interesse</strong> — para segurança, prevenção a fraudes e melhoria da plataforma</li>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Cumprimento de obrigação legal</strong> — quando exigido por lei ou regulação</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>5. Compartilhamento de dados</h2>
            <p>Utilizamos os seguintes fornecedores de infraestrutura para operar a plataforma:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Supabase</strong> — banco de dados e autenticação (EUA, com cláusulas de proteção GDPR)</li>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Vercel</strong> — hospedagem da aplicação (EUA)</li>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Resend</strong> — envio de e-mails transacionais</li>
              <li><strong style={{ color: '#f5f3f0', fontWeight: 400 }}>Nuvemshop</strong> — integração via API para leitura de pedidos</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Todos os fornecedores operam sob contratos com cláusulas de proteção de dados compatíveis com a LGPD.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>6. Seus direitos</h2>
            <p>Como titular de dados, você tem direito a:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação dos dados</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail{' '}
              <a href="mailto:suporte@bongiatech.com.br" style={{ color: '#6b6560' }}>suporte@bongiatech.com.br</a>.
              Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>7. Retenção de dados</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Dados de lojistas: mantidos enquanto a conta estiver ativa + 5 anos após encerramento (obrigação fiscal)</li>
              <li>Dados de afiliados: mantidos enquanto o vínculo com a loja estiver ativo + 2 anos</li>
              <li>Logs de cliques e vendas: mantidos por 2 anos</li>
              <li>Após os prazos, os dados são anonimizados ou eliminados</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>8. Cookies e rastreamento</h2>
            <p>
              Utilizamos cookies de sessão para autenticação na plataforma. Não utilizamos cookies de rastreamento
              de terceiros ou publicidade. O link de rastreamento de afiliados utiliza um token único na URL
              para atribuição de vendas — nenhum dado pessoal do comprador é armazenado nesse processo.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>9. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados pessoais, incluindo
              criptografia em trânsito (TLS), controle de acesso por função, autenticação via magic link
              e tokens OAuth, e isolamento de dados por lojista via Row Level Security no banco de dados.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas
              por e-mail com pelo menos 15 dias de antecedência. A data da última atualização está sempre
              indicada no topo desta página.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#f5f3f0', marginBottom: '0.75rem' }}>11. Contato</h2>
            <p>
              Para dúvidas, solicitações ou reclamações relacionadas à privacidade e proteção de dados:
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              E-mail: <a href="mailto:suporte@bongiatech.com.br" style={{ color: '#6b6560' }}>suporte@bongiatech.com.br</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}

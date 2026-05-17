import LoginForm from './LoginForm'

export default async function AfiliadoLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0b0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.5rem', color: '#f5f3f0', fontWeight: 400, margin: 0 }}>
            BongiaTech
          </h1>
          <p style={{ color: '#6b6560', fontSize: '12px', fontWeight: 300, marginTop: '4px' }}>
            Painel do Afiliado
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#111010', border: '1px solid rgba(255,255,255,0.07)', padding: '2rem' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0', marginBottom: '1.5rem', marginTop: 0 }}>
            Acessar meu painel
          </h2>

          {erro === 'link_expirado' && (
            <div style={{
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
              padding: '10px 12px', marginBottom: '1.25rem',
              fontSize: '12px', color: '#d97706', fontWeight: 300,
            }}>
              Link expirado ou inválido. Solicite um novo abaixo.
            </div>
          )}

          <LoginForm />
        </div>

        <p style={{ textAlign: 'center', color: '#4a4440', fontSize: '11px', marginTop: '1.5rem', fontWeight: 300 }}>
          É lojista?{' '}
          <a href="/login" style={{ color: '#6b6560', textDecoration: 'underline' }}>
            Acesse o dashboard
          </a>
        </p>
      </div>
    </div>
  )
}

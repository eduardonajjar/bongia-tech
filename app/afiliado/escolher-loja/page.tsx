import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarSessionToken, COOKIE_SESSION } from '@/lib/afiliado/session'

export default async function EscolherLojaPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(COOKIE_SESSION)?.value || ''
  const email = verificarSessionToken(sessionToken)

  if (!email) redirect('/afiliado/login')

  const supabase = await createServiceClient()

  const { data: afiliados } = await supabase
    .from('afiliados')
    .select('id, nome, ref_code, saldo, total_cliques, lojista_id, lojistas(nome)')
    .eq('email', email)
    .eq('ativo', true)
    .order('criado_em', { ascending: true })

  if (!afiliados || afiliados.length === 0) redirect('/afiliado/login')
  if (afiliados.length === 1) redirect(`/afiliado/dashboard?a=${afiliados[0].id}`)

  return (
    <div style={{ minHeight: '100vh', background: '#0c0b0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.5rem', color: '#f5f3f0', fontWeight: 400, margin: 0 }}>
            BongiaTech
          </h1>
          <p style={{ color: '#6b6560', fontSize: '12px', fontWeight: 300, marginTop: '4px' }}>
            Você é afiliado em {afiliados.length} lojas. Escolha qual quer ver.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {afiliados.map((a) => {
            const loja = a.lojistas as unknown as { nome: string } | null
            return (
              <a
                key={a.id}
                href={`/afiliado/dashboard?a=${a.id}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#111010', padding: '1.25rem 1.5rem', textDecoration: 'none',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 400, color: '#f5f3f0', margin: 0 }}>{loja?.nome || 'Loja'}</p>
                  <p style={{ fontSize: '11px', color: '#6b6560', fontWeight: 300, margin: '3px 0 0' }}>
                    {a.total_cliques} cliques · Saldo: R$ {Number(a.saldo).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <span style={{ color: '#4a4440', fontSize: '16px' }}>→</span>
              </a>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/api/afiliado/logout" style={{ fontSize: '11px', color: '#4a4440', textDecoration: 'underline' }}>
            Sair
          </a>
        </div>
      </div>
    </div>
  )
}

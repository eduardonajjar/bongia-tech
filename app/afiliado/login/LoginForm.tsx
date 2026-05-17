'use client'

import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'erro'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    const res = await fetch('/api/afiliado/solicitar-acesso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setStatus(res.ok ? 'sent' : 'erro')
  }

  if (status === 'sent') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', margin: '0 auto 1.5rem',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>
          ✓
        </div>
        <p style={{ color: '#f5f3f0', fontSize: '14px', marginBottom: '8px' }}>
          Link enviado para <strong>{email}</strong>
        </p>
        <p style={{ color: '#6b6560', fontSize: '12px', fontWeight: 300 }}>
          Verifique sua caixa de entrada. O link expira em 1 hora.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{ marginTop: '1.5rem', color: '#6b6560', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Usar outro email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#6b6560', fontWeight: 300, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Seu email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
          style={{
            width: '100%', padding: '10px 12px',
            background: '#0c0b0a', border: '1px solid rgba(255,255,255,0.12)',
            color: '#f5f3f0', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {status === 'erro' && (
        <p style={{ color: '#d97706', fontSize: '12px', marginBottom: '0.75rem', fontWeight: 300 }}>
          Erro ao enviar. Tente novamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          width: '100%', padding: '10px',
          background: '#f5f3f0', color: '#0c0b0a',
          border: 'none', fontSize: '13px', fontWeight: 500,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.6 : 1,
        }}
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar link de acesso'}
      </button>

      <p style={{ color: '#4a4440', fontSize: '11px', marginTop: '1rem', textAlign: 'center', fontWeight: 300 }}>
        Sem senha. Você receberá um link seguro por email.
      </p>
    </form>
  )
}

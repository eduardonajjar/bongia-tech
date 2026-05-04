'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle, Video, Share2 } from 'lucide-react'

interface Props {
  link: string
  refCode: string
}

export default function CopiarLink({ link, refCode }: Props) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Compre pelo meu link e aproveite: ${link}`)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        padding: '12px',
      }}>
        <code style={{ flex: 1, fontSize: '13px', color: '#6b6560', wordBreak: 'break-all', fontFamily: 'monospace', fontWeight: 300 }}>{link}</code>
        <button
          onClick={copiar}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            background: '#f5f3f0', color: '#0c0b0a',
            border: 'none', padding: '6px 12px',
          }}
        >
          {copiado ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
          {copiado ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#25d366', color: '#fff',
            padding: '8px 14px', textDecoration: 'none',
            fontSize: '13px', fontWeight: 500,
          }}
        >
          <MessageCircle style={{ width: '14px', height: '14px' }} />
          WhatsApp
        </a>
        <button
          onClick={copiar}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
            color: '#fff', padding: '8px 14px',
            fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
          }}
        >
          <Share2 style={{ width: '14px', height: '14px' }} />
          Instagram (copiar)
        </button>
        <button
          onClick={copiar}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#141312', color: '#f5f3f0',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          <Video style={{ width: '14px', height: '14px' }} />
          TikTok (copiar)
        </button>
      </div>
    </div>
  )
}

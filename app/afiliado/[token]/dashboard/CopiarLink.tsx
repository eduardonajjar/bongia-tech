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
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <code className="flex-1 text-sm text-gray-700 break-all">{link}</code>
        <button
          onClick={copiar}
          className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 bg-white border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <button
          onClick={copiar}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Share2 className="w-4 h-4" />
          Instagram (copiar)
        </button>
        <button
          onClick={copiar}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Video className="w-4 h-4" />
          TikTok (copiar)
        </button>
      </div>
    </div>
  )
}

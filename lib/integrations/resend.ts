import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}
const FROM = 'BongiaTech <noreply@bongiatech.com.br>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function enviarBoasVindasAfiliado(dados: {
  nome: string
  email: string
  token: string
  refCode: string
  nomeLoja: string
  linkAfiliado: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: dados.email,
    subject: `Você foi convidado para o programa de afiliados da ${dados.nomeLoja}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#6d28d9">Bem-vindo ao programa de afiliados!</h2>
        <p>Olá, <strong>${dados.nome}</strong>!</p>
        <p><strong>${dados.nomeLoja}</strong> convidou você para participar do programa de afiliados. Você ganha comissão por cada venda feita através do seu link.</p>
        <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0 0 8px;font-weight:bold">Seu link de afiliado:</p>
          <code style="background:#ede9fe;padding:8px 12px;border-radius:4px;display:block;word-break:break-all">${dados.linkAfiliado}</code>
        </div>
        <a href="${APP_URL}/afiliado/${dados.token}/dashboard" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">
          Acessar meu painel
        </a>
        <p style="color:#6b7280;font-size:14px;margin-top:24px">Compartilhe seu link no WhatsApp, Instagram ou TikTok e ganhe comissão por cada venda.</p>
      </div>
    `,
  })
}

export async function enviarNotificacaoVenda(dados: {
  nome: string
  email: string
  valorComissao: number
  saldoAtual: number
  token: string
}) {
  const comissaoFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valorComissao)
  const saldoFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.saldoAtual)

  return getResend().emails.send({
    from: FROM,
    to: dados.email,
    subject: `Nova venda! Você ganhou ${comissaoFmt} de comissão`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#059669">Nova venda realizada!</h2>
        <p>Olá, <strong>${dados.nome}</strong>!</p>
        <p>Uma venda foi registrada através do seu link de afiliado.</p>
        <div style="background:#ecfdf5;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0 0 4px">Comissão desta venda: <strong style="color:#059669">${comissaoFmt}</strong></p>
          <p style="margin:0">Saldo acumulado: <strong>${saldoFmt}</strong></p>
        </div>
        <a href="${APP_URL}/afiliado/${dados.token}/dashboard" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
          Ver meu painel
        </a>
      </div>
    `,
  })
}

export async function enviarConfirmacaoPix(dados: {
  nome: string
  email: string
  valor: number
  token: string
}) {
  const valorFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valor)

  return getResend().emails.send({
    from: FROM,
    to: dados.email,
    subject: `PIX enviado! Você recebeu ${valorFmt}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#6d28d9">PIX enviado com sucesso!</h2>
        <p>Olá, <strong>${dados.nome}</strong>!</p>
        <p>Sua comissão foi paga via PIX.</p>
        <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:24px 0;text-align:center">
          <p style="font-size:32px;font-weight:bold;color:#7c3aed;margin:0">${valorFmt}</p>
          <p style="color:#6b7280;margin:4px 0 0">transferido para sua chave PIX</p>
        </div>
        <a href="${APP_URL}/afiliado/${dados.token}/dashboard" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
          Ver histórico
        </a>
      </div>
    `,
  })
}

export async function enviarAlertaTrialExpirando(dados: {
  email: string
  nome: string
  vendasGeradas: number
  comissaoTotal: number
}) {
  const comissaoFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.comissaoTotal)

  return getResend().emails.send({
    from: FROM,
    to: dados.email,
    subject: 'Seu trial da BongiaTech expira em 3 dias',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#d97706">Seu trial expira em 3 dias</h2>
        <p>Olá, <strong>${dados.nome}</strong>!</p>
        <p>Durante seu trial de 14 dias, a BongiaTech gerou:</p>
        <div style="background:#fffbeb;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0 0 4px">Vendas via afiliados: <strong>${dados.vendasGeradas}</strong></p>
          <p style="margin:0">Total em comissões processadas: <strong style="color:#059669">${comissaoFmt}</strong></p>
        </div>
        <a href="${APP_URL}/dashboard/configuracoes?plano=true" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
          Assinar agora — R$149/mês
        </a>
        <p style="color:#6b7280;font-size:14px;margin-top:16px">Sem cartão de crédito necessário. Pague via PIX mensal.</p>
      </div>
    `,
  })
}

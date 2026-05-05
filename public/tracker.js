/**
 * BongiaTech Tracker v2.1
 * Instale em TODAS as páginas da loja via Nuvemshop > Configurações > Códigos externos.
 *
 * Fluxo:
 * 1. Visitante clica link de afiliado → bongia-tech.vercel.app/loja?ref=CODIGO
 * 2. Nossa página registra o clique e redireciona para a loja com ?bt_sid=UUID&bt_ref=CODIGO
 * 3. Este script detecta ?bt_sid=, grava o cookie bt_session no domínio da loja
 * 4. No checkout, o session_id é injetado na nota do pedido
 * 5. Webhook order/paid recebe a nota e atribui a venda ao afiliado
 */
(function (APP_URL) {
  var COOKIE_SESSION = 'bt_session';
  var COOKIE_REF = 'bt_ref';
  var ATTRIBUTION_DAYS = 30;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie =
      name + '=' + encodeURIComponent(value) +
      '; expires=' + expires.toUTCString() +
      '; path=/; SameSite=Lax';
  }

  // ─── 1. Captura sessão vinda da BongiaTech (após redirect de /loja) ──────

  var params = new URLSearchParams(window.location.search);
  var btSid = params.get('bt_sid');   // session_id já registrado no servidor
  var btRef = params.get('bt_ref');   // ref_code do afiliado

  if (btSid) {
    // Grava cookies no domínio da loja (crítico para atribuição funcionar)
    setCookie(COOKIE_SESSION, btSid, ATTRIBUTION_DAYS);
    if (btRef) setCookie(COOKIE_REF, btRef, ATTRIBUTION_DAYS);

    // Limpa os parâmetros da URL sem recarregar a página
    try {
      var cleanUrl = window.location.pathname + window.location.hash;
      var remainingParams = new URLSearchParams(window.location.search);
      remainingParams.delete('bt_sid');
      remainingParams.delete('bt_ref');
      var qs = remainingParams.toString();
      if (qs) cleanUrl += '?' + qs;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch(e) {}
  }

  // ─── 2. Injeta session_id na nota do carrinho ─────────────────────────────

  var sessionId = getCookie(COOKIE_SESSION);
  if (!sessionId) return; // Sem sessão = não é visita de afiliado

  var noteValue = 'bt=' + sessionId;

  function injetarNota() {
    // Tenta via endpoint AJAX do carrinho Nuvemshop
    var formData = new FormData();
    formData.append('note', noteValue);
    fetch('/carrinho/nota', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }).catch(function () {});

    // Injeta em campos de nota existentes na página
    var noteFields = document.querySelectorAll('input[name="note"], textarea[name="note"]');
    for (var i = 0; i < noteFields.length; i++) {
      var existing = noteFields[i].value || '';
      if (existing.indexOf('bt=') === -1) {
        noteFields[i].value = existing ? existing + ' | ' + noteValue : noteValue;
      }
    }
  }

  injetarNota();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injetarNota);
  }

  // ─── 3. Intercepta submit de formulários de checkout ─────────────────────

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.action) return;
    var action = form.action.toLowerCase();
    if (
      action.indexOf('/checkout') === -1 &&
      action.indexOf('/carrinho') === -1 &&
      action.indexOf('/pedido') === -1
    ) return;

    var existing = form.querySelector('[name="note"]');
    if (!existing) {
      var hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'note';
      hidden.value = noteValue;
      form.appendChild(hidden);
    } else if (existing.value.indexOf('bt=') === -1) {
      existing.value = existing.value ? existing.value + ' | ' + noteValue : noteValue;
    }
  }, true);

})(
  typeof BONGIA_APP_URL !== 'undefined'
    ? BONGIA_APP_URL
    : 'https://bongia-tech.vercel.app'
);

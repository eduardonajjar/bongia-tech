/**
 * BongiaTech Tracker v1.0
 * Injete este script em todas as páginas da sua loja Nuvemshop.
 * Substitua BONGIA_APP_URL pela URL da sua instância BongiaTech.
 */
(function (BONGIA_APP_URL) {
  var params = new URLSearchParams(window.location.search);
  var ref = params.get('ref');
  if (!ref) return;

  var expires = new Date();
  expires.setDate(expires.getDate() + 30);
  var opts = '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';

  document.cookie = 'bt_ref=' + ref + opts;

  var sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  document.cookie = 'bt_session=' + sessionId + opts;

  fetch(BONGIA_APP_URL + '/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ref_code: ref,
      session_id: sessionId,
      url_origem: document.referrer,
    }),
  }).catch(function () {});
})('__BONGIA_APP_URL__');

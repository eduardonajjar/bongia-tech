export const COOKIE_REF = 'bt_ref'
export const COOKIE_SESSION = 'bt_session'
export const ATTRIBUTION_DAYS = 30

export function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=')
      return [key.trim(), rest.join('=').trim()]
    })
  )
}

export function buildTrackingScript(appUrl: string): string {
  return `
(function() {
  var params = new URLSearchParams(window.location.search);
  var ref = params.get('ref');
  if (!ref) return;

  var expires = new Date();
  expires.setDate(expires.getDate() + ${ATTRIBUTION_DAYS});
  var opts = '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';

  document.cookie = '${COOKIE_REF}=' + ref + opts;

  var sessionId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
    return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
  });
  document.cookie = '${COOKIE_SESSION}=' + sessionId + opts;

  fetch('${appUrl}/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref_code: ref, session_id: sessionId, url_origem: document.referrer })
  }).catch(function(){});
})();
`.trim()
}

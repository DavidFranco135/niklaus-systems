import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Contador de visitas do site público.
 * Grava eventos anônimos na coleção `site_events`:
 *  - type "visit": uma por abertura da página (com origem, aparelho, região aproximada)
 *  - type "click": cada clique em botão/link (com o nome do botão e a seção da página)
 * O visitante é identificado só por um código aleatório guardado no navegador.
 * Falhas são ignoradas: o contador nunca pode atrapalhar o site.
 */

const VISITOR_KEY = 'nk-visitor-id';
const SESSION_KEY = 'nk-visit-sent';
const COL = 'site_events';

function randomId(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  } catch { /* gerador simples abaixo */ }
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
}

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !/^[a-z0-9]{8,64}$/i.test(id)) {
      id = randomId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

function isAdminBrowser(): boolean {
  try { return localStorage.getItem('nk-no-track') === '1'; } catch { return false; }
}

/** Marca este navegador como seu (não conta suas próprias visitas). */
export function setOwnBrowser(on: boolean) {
  try { on ? localStorage.setItem('nk-no-track', '1') : localStorage.removeItem('nk-no-track'); } catch { /* */ }
}
export function isOwnBrowser() { return isAdminBrowser(); }

export function today(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const cut = (s: string | null | undefined, n = 120) => (s || '').slice(0, n);

/** De onde a pessoa veio: Google, Instagram, WhatsApp, direto... */
export function classifySource(referrer: string, utm: string): string {
  if (utm) return cut(utm.toLowerCase(), 40);
  if (!referrer) return 'direto';
  let host = '';
  try { host = new URL(referrer).hostname.replace(/^www\./, ''); } catch { return 'outro'; }
  if (host === location.hostname) return 'direto';
  const map: [RegExp, string][] = [
    [/google\./, 'google'], [/bing\./, 'bing'], [/duckduckgo/, 'duckduckgo'], [/yahoo\./, 'yahoo'],
    [/instagram\.com|l\.instagram/, 'instagram'], [/facebook\.com|fb\.com|l\.facebook/, 'facebook'],
    [/whatsapp|wa\.me/, 'whatsapp'], [/linkedin|lnkd\.in/, 'linkedin'], [/t\.co$|twitter|x\.com/, 'twitter/x'],
    [/tiktok/, 'tiktok'], [/youtube|youtu\.be/, 'youtube'], [/github/, 'github'],
    [/winnercakes|moria-ceramica|keystudio3d/, 'sites de clientes'],
  ];
  for (const [re, name] of map) if (re.test(host)) return name;
  return cut(host, 40);
}

function device(): string {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'celular';
  return 'computador';
}

function os(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'outro';
}

function region(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return cut(tz, 40);
  } catch { return ''; }
}

function send(data: Record<string, unknown>) {
  if (isAdminBrowser()) return;
  addDoc(collection(db, COL), {
    ...data,
    visitor: visitorId(),
    day: today(),
    at: serverTimestamp(),
  }).catch(() => { /* ignora */ });
}

/** Conta a visita (uma vez por aba). */
export function trackVisit() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch { /* segue */ }
  const params = new URLSearchParams(location.search);
  const ref = document.referrer || '';
  let refHost = '';
  try { refHost = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''; } catch { /* */ }
  send({
    type: 'visit',
    source: classifySource(ref, params.get('utm_source') || params.get('ref') || ''),
    referrer: cut(refHost, 80),
    campaign: cut(params.get('utm_campaign'), 60),
    device: device(),
    os: os(),
    region: region(),
    lang: cut(navigator.language, 12),
  });
}

/** Registra um clique (nome do botão + seção onde ele está). */
export function trackClick(target: string, section = '') {
  send({ type: 'click', target: cut(target, 80), section: cut(section, 30), device: device() });
}

/**
 * Escuta cliques em toda a página. Usa data-track quando existir;
 * senão o texto do botão/link. A seção vem do <section id> mais próximo.
 */
export function installClickTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track],a,button');
    if (!el || el.closest('[data-notrack]')) return;
    const label = el.dataset.track
      || el.getAttribute('aria-label')
      || (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!label) return;
    const section = el.closest<HTMLElement>('[data-section],section[id],nav,footer');
    const name = section?.dataset.section || section?.id || section?.tagName.toLowerCase() || '';
    trackClick(label, name);
  };
  document.addEventListener('click', onClick, { capture: true });
  return () => document.removeEventListener('click', onClick, { capture: true });
}

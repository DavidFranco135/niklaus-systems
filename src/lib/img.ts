/// <reference types="vite/client" />
// Fotos do ImgBB passam pela função /img da Cloudflare (functions/img.js),
// que entrega uma versão reduzida (WebP) e guardada em cache perto do
// visitante. Direto do i.ibb.co muitas conexões no Brasil ficam lentas.
// Se a função falhar, o onError troca para a foto original.
const IBB = 'https://i.ibb.co/';

export const W = { card: 640, large: 1280, hero: 1920 } as const;

export function imgSrc(url: string | undefined, width: number): string {
  if (!url) return '';
  if (import.meta.env.DEV || !url.startsWith(IBB)) return url;
  return `/img?u=${encodeURIComponent(url)}&w=${width}`;
}

/** onError: volta para a URL original uma única vez. */
export function fallbackToOriginal(original: string) {
  return (e: { currentTarget: HTMLImageElement }) => {
    const el = e.currentTarget;
    if (el.dataset.fallback || !original) return;
    el.dataset.fallback = '1';
    el.src = original;
  };
}

const preloaded = new Set<string>();
/** Baixa as fotos antes de a pessoa precisar delas. */
export function preload(urls: string[], width: number) {
  urls.forEach(u => {
    const src = imgSrc(u, width);
    if (!src || preloaded.has(src)) return;
    preloaded.add(src);
    const i = new Image();
    i.decoding = 'async';
    i.src = src;
  });
}

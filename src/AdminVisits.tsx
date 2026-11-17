import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { Images, Eye, MousePointerClick, UserRound, Globe2, Smartphone, MapPin, RefreshCw, ShieldOff } from 'lucide-react';
import { db } from './firebase';
import { isOwnBrowser, setOwnBrowser, today } from './lib/analytics';
import { GalleryItem } from './types';

type Ev = {
  type: 'visit' | 'click';
  visitor: string;
  day: string;
  at?: Timestamp;
  source?: string;
  referrer?: string;
  device?: string;
  os?: string;
  region?: string;
  target?: string;
  section?: string;
};

const SECTION_NAMES: Record<string, string> = {
  inicio: 'Topo', sobre: 'Sobre', servicos: 'Serviços', portfolio: 'Portfólio',
  contato: 'Contato', nav: 'Menu', footer: 'Rodapé', lightbox: 'Projeto aberto',
};

const REGION_NAMES: Record<string, string> = {
  'America/Sao_Paulo': 'Sudeste/Sul (Brasília)',
  'America/Bahia': 'Bahia', 'America/Fortaleza': 'Nordeste', 'America/Recife': 'Pernambuco',
  'America/Belem': 'Pará/Amapá', 'America/Manaus': 'Amazonas', 'America/Cuiaba': 'Mato Grosso',
  'America/Campo_Grande': 'Mato Grosso do Sul', 'America/Porto_Velho': 'Rondônia',
  'America/Rio_Branco': 'Acre', 'America/Boa_Vista': 'Roraima', 'America/Maceio': 'Alagoas',
  'America/Araguaina': 'Tocantins', 'America/Noronha': 'Fernando de Noronha',
};

const regionLabel = (r?: string) => (r ? REGION_NAMES[r] || r.replace(/_/g, ' ') : 'desconhecida');

function countBy<T>(arr: T[], key: (x: T) => string | undefined) {
  const m = new Map<string, number>();
  arr.forEach(x => { const k = key(x) || '—'; m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function daysBack(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return today(d);
}

const Box = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white/[0.02] p-6 sm:p-8 rounded-[2rem] border border-white/5">
    <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-5">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Bars = ({ rows, empty = 'Sem dados ainda', limit = 8 }: { rows: [string, number][]; empty?: string; limit?: number }) => {
  if (!rows.length) return <p className="text-slate-600 text-sm">{empty}</p>;
  const max = rows[0][1] || 1;
  return (
    <ul className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
      {rows.slice(0, limit).map(([k, v]) => (
        <li key={k}>
          <div className="flex justify-between text-sm mb-1.5 gap-3">
            <span className="text-slate-300 font-medium truncate">{k}</span>
            <span className="text-white font-black shrink-0">{v}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full" style={{ width: `${(v / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default function AdminVisits() {
  const [range, setRange] = useState<7 | 30>(30);
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [error, setError] = useState('');
  const [own, setOwn] = useState(isOwnBrowser());
  const [tick, setTick] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'gallery'), orderBy('created_at', 'desc')))
      .then(snap => setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setError('');
    getDocs(query(collection(db, 'site_events'), where('day', '>=', daysBack(29))))
      .then(snap => setEvents(snap.docs.map(d => d.data() as Ev)))
      .catch(e => {
        setEvents([]);
        setError(String(e?.code || e?.message || e).includes('permission')
          ? 'Sem permissão para ler as visitas — atualize as regras do Firestore (veja o README).'
          : 'Não foi possível carregar as visitas.');
      });
  }, [tick]);

  const data = useMemo(() => {
    if (!events) return null;
    const from = daysBack(range - 1);
    const evs = events.filter(e => e.day >= from);
    const visits = evs.filter(e => e.type === 'visit');
    const clicks = evs.filter(e => e.type === 'click');
    const t = today();
    const todayVisits = visits.filter(v => v.day === t);
    const days: { day: string; visits: number; people: number }[] = [];
    for (let i = Math.min(range, 14) - 1; i >= 0; i--) {
      const d = daysBack(i);
      const vs = visits.filter(v => v.day === d);
      days.push({ day: d, visits: vs.length, people: new Set(vs.map(v => v.visitor)).size });
    }
    const recent = [...evs]
      .sort((a, b) => (b.at?.toMillis() || 0) - (a.at?.toMillis() || 0))
      .slice(0, 15);
    return {
      todayVisits: todayVisits.length,
      todayPeople: new Set(todayVisits.map(v => v.visitor)).size,
      visits: visits.length,
      people: new Set(visits.map(v => v.visitor)).size,
      clicks: clicks.length,
      orcamento: clicks.filter(c => /orçamento|whatsapp/i.test(c.target || '')).length,
      days,
      sources: countBy(visits, v => v.source),
      devices: countBy(visits, v => `${v.device || '?'} · ${v.os || '?'}`),
      regions: countBy(visits, v => regionLabel(v.region)),
      targets: countBy(clicks.filter(c => !/^Foto \d+ · /.test(c.target || '')), c => c.target),
      clickList: clicks,
      sections: countBy(clicks, c => SECTION_NAMES[c.section || ''] || c.section),
      recent,
    };
  }, [events, range]);

  const portfolio = useMemo(() => {
    if (!data) return [];
    const opens = new Map<string, { n: number; people: Set<string> }>();
    const photos = new Map<string, Map<number, number>>();
    data.clickList.forEach(c => {
      const t = c.target || '';
      const mo = t.match(/^Projeto: (.+)$/);
      if (mo) {
        const o = opens.get(mo[1]) || { n: 0, people: new Set<string>() };
        o.n++; o.people.add(c.visitor); opens.set(mo[1], o);
      }
      const mf = t.match(/^Foto (\d+) · (.+)$/);
      if (mf) {
        const m = photos.get(mf[2]) || new Map<number, number>();
        m.set(+mf[1], (m.get(+mf[1]) || 0) + 1); photos.set(mf[2], m);
      }
    });
    const titles = new Set([...gallery.map(g => g.title), ...opens.keys()]);
    return [...titles].map(title => {
      const g = gallery.find(x => x.title === title);
      const total = g ? 1 + (g.images?.length || 0) : Math.max(0, ...[...(photos.get(title)?.keys() || [])]);
      const ph = photos.get(title) || new Map<number, number>();
      return {
        title, thumb: g?.url, removed: !g,
        opens: opens.get(title)?.n || 0,
        people: opens.get(title)?.people.size || 0,
        photos: Array.from({ length: total }, (_, i) => ph.get(i + 1) || 0),
      };
    }).sort((a, b) => b.opens - a.opens);
  }, [data, gallery]);

  const maxDay = Math.max(1, ...(data?.days.map(d => d.visits) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Visitas do site</h2>
          <p className="text-slate-500 text-sm">Quem entrou, de onde veio e onde clicou (anônimo).</p>
        </div>
        <div className="flex items-center gap-2">
          {([7, 30] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${range === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {r} dias
            </button>
          ))}
          <button onClick={() => setTick(x => x + 1)} title="Atualizar"
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"><RefreshCw size={16} /></button>
        </div>
      </div>

      {error && <p className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">{error}</p>}

      {!data ? (
        <div className="h-40 bg-white/5 rounded-[2rem] animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: 'Hoje', v: data.todayVisits, s: `${data.todayPeople} pessoa(s)`, i: <Eye size={18} /> },
              { l: `Visitas (${range}d)`, v: data.visits, s: `${data.people} pessoa(s) diferentes`, i: <UserRound size={18} /> },
              { l: `Cliques (${range}d)`, v: data.clicks, s: 'em botões e links', i: <MousePointerClick size={18} /> },
              { l: 'Orçamento / WhatsApp', v: data.orcamento, s: 'cliques que abriram o WhatsApp', i: <MousePointerClick size={18} /> },
            ].map(c => (
              <div key={c.l} className="bg-white/[0.03] p-5 sm:p-6 rounded-[1.75rem] border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 mb-3">{c.i}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{c.l}</span>
                </div>
                <p className="text-3xl font-display font-bold text-white">{c.v}</p>
                <p className="text-xs text-slate-500 mt-1">{c.s}</p>
              </div>
            ))}
          </div>

          <Box title="Visitas por dia" icon={<Eye size={16} />}>
            <div className="flex items-end gap-1.5 sm:gap-2 h-40">
              {data.days.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 min-w-0" title={`${d.visits} visita(s), ${d.people} pessoa(s)`}>
                  <span className="text-[10px] text-slate-400 font-bold">{d.visits || ''}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-400"
                    style={{ height: `${(d.visits / maxDay) * 100}%`, minHeight: d.visits ? 4 : 2, opacity: d.visits ? 1 : 0.15 }} />
                  <span className="text-[9px] text-slate-600">{d.day.slice(8)}/{d.day.slice(5, 7)}</span>
                </div>
              ))}
            </div>
          </Box>

          <Box title="Portfólio — cliques em cada projeto e foto" icon={<Images size={16} />}>
            {portfolio.length === 0 ? <p className="text-slate-600 text-sm">Nenhum projeto cadastrado</p> : (
              <ul className="divide-y divide-white/5">
                {portfolio.map(p => (
                  <li key={p.title} className="flex items-center gap-4 py-3">
                    {p.thumb
                      ? <img src={p.thumb} alt="" className="w-16 h-11 rounded-lg object-cover shrink-0 bg-white/5" referrerPolicy="no-referrer" />
                      : <div className="w-16 h-11 rounded-lg bg-white/5 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm truncate">{p.title}{p.removed && <span className="text-slate-600 font-normal"> (removido)</span>}</p>
                      {p.photos.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {p.photos.map((n, i) => (
                            <span key={i} title={`Foto ${i + 1}: vista ${n} vez(es)`}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${n ? 'bg-indigo-500/15 text-indigo-300' : 'bg-white/5 text-slate-600'}`}>
                              Foto {i + 1}: {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-display font-bold text-white leading-none">{p.opens}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{p.opens === 1 ? 'clique' : 'cliques'} · {p.people} pess.</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Box>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Box title="Todos os botões clicados" icon={<MousePointerClick size={16} />}>
              <Bars rows={data.targets} empty="Nenhum clique ainda" limit={100} />
            </Box>
            <Box title="Seções mais clicadas" icon={<MousePointerClick size={16} />}>
              <Bars rows={data.sections} empty="Nenhum clique ainda" />
            </Box>
            <Box title="De onde vieram" icon={<Globe2 size={16} />}>
              <Bars rows={data.sources} />
            </Box>
            <Box title="Região (fuso horário)" icon={<MapPin size={16} />}>
              <Bars rows={data.regions} />
            </Box>
            <Box title="Aparelho" icon={<Smartphone size={16} />}>
              <Bars rows={data.devices} />
            </Box>
            <Box title="Últimas atividades" icon={<RefreshCw size={16} />}>
              {data.recent.length === 0 ? <p className="text-slate-600 text-sm">Sem dados ainda</p> : (
                <ul className="space-y-2.5 text-sm">
                  {data.recent.map((e, i) => (
                    <li key={i} className="flex gap-3 items-baseline">
                      <span className="text-[11px] text-slate-600 w-20 shrink-0">
                        {e.at ? e.at.toDate().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                      <span className="text-slate-300 truncate">
                        {e.type === 'visit'
                          ? <>Visita · {e.source} · {e.device} · {regionLabel(e.region)}</>
                          : <>Clicou em <b className="text-white">{e.target}</b>{e.section ? ` (${SECTION_NAMES[e.section] || e.section})` : ''}</>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Box>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={own} className="accent-indigo-500 w-4 h-4"
              onChange={e => { setOwnBrowser(e.target.checked); setOwn(e.target.checked); }} />
            <ShieldOff size={15} /> Não contar as visitas deste navegador (use no seu celular/computador)
          </label>
        </>
      )}
    </div>
  );
}

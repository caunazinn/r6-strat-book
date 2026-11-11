'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import { useStrat } from '@/lib/store';
import { MAPS, getMap } from '@/lib/maps';
import { OPERATORS } from '@/lib/operators';
import { getStratBySlug, loadDraft, saveStrat } from '@/lib/strats';
import type { StratData, Tool } from '@/lib/types';
import AuthButton from './AuthButton';

// Konva precisa do browser: sem SSR
const StratCanvas = dynamic(() => import('./StratCanvas'), { ssr: false });

const TOOLS: { id: Tool; label: string; hint: string }[] = [
  { id: 'select', label: 'Mover', hint: 'Arraste itens e o mapa' },
  { id: 'path', label: 'Rota', hint: 'Desenho livre' },
  { id: 'arrow', label: 'Seta', hint: 'Seta reta' },
  { id: 'rotation', label: 'Rotação', hint: 'Seta tracejada' },
  { id: 'reinforce', label: 'Reforço', hint: 'Duplo clique gira a parede' },
  { id: 'breach', label: 'Breach', hint: 'Alvo de breach' },
  { id: 'drone', label: 'Drone', hint: 'Posição de drone' },
  { id: 'note', label: 'Nota', hint: 'Texto livre' },
  { id: 'erase', label: 'Apagar', hint: 'Clique em um item' },
];
const COLORS = ['#f2b134', '#e8553d', '#3ea0d8', '#5fd38d', '#ffffff'];

export default function Editor({ slug }: { slug?: string }) {
  const s = useStrat();
  const stageRef = useRef<Konva.Stage>(null);
  const [msg, setMsg] = useState<string>('');
  const readOnly = !!slug;
  const map = getMap(s.mapId);

  // carrega strat compartilhada
  useEffect(() => {
    if (!slug) return;
    getStratBySlug(slug).then(useStrat.getState().load).catch((e) => setMsg(e.message));
  }, [slug]);

  // atalhos: Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || readOnly) return;
      if (e.key === 'z') { e.preventDefault(); e.shiftKey ? s.redo() : s.undo(); }
      if (e.key === 'y') { e.preventDefault(); s.redo(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const data = (): StratData => ({ title: s.title, mapId: s.mapId, scene: s.scene });

  const save = async () => {
    try {
      const r = await saveStrat(data());
      if (r.local) setMsg('Rascunho salvo neste navegador.');
      else {
        const url = `${location.origin}/s/${r.slug}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        setMsg(`Salvo! Link copiado: ${url}`);
      }
    } catch (e) { setMsg((e as Error).message); }
  };

  const download = (href: string, name: string) => {
    const a = document.createElement('a');
    a.href = href; a.download = name; a.click();
  };
  const exportPng = () => download(stageRef.current!.toDataURL({ pixelRatio: 2 }), `${s.title}.png`);
  const exportJson = () => download(URL.createObjectURL(new Blob([JSON.stringify(data(), null, 2)], { type: 'application/json' })), `${s.title}.json`);
  const importJson = (f: File) => f.text().then((t) => s.load(JSON.parse(t))).catch(() => setMsg('JSON inválido.'));

  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-panel px-3 py-2">
        <a href="/" className="mr-2 font-bold">R6 Strat-Book</a>
        <input value={s.title} onChange={(e) => s.setTitle(e.target.value)} readOnly={readOnly} aria-label="Título da strat" className="w-44 rounded border border-line bg-ink px-2 py-1 text-sm" />
        {!readOnly && (
          <>
            <button className="btn" onClick={s.undo} disabled={!s.past.length}>Desfazer</button>
            <button className="btn" onClick={s.redo} disabled={!s.future.length}>Refazer</button>
            <button className="btn" onClick={s.clearFloor}>Limpar andar</button>
            <button className="btn" onClick={() => { const d = loadDraft(); d ? s.load(d) : setMsg('Nenhum rascunho local.'); }}>Abrir rascunho</button>
            <button className="btn btn-on" onClick={save}>Salvar e compartilhar</button>
          </>
        )}
        <button className="btn" onClick={exportPng}>PNG</button>
        <button className="btn" onClick={exportJson}>JSON</button>
        {!readOnly && (
          <label className="btn cursor-pointer">
            Importar
            <input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </label>
        )}
        <span className="ml-auto"><AuthButton /></span>
      </header>
      {msg && <p role="status" className="bg-ink px-3 py-1 text-xs text-amber">{msg}</p>}

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-panel p-3">
          <label className="text-sm">
            Mapa
            <select value={s.mapId} onChange={(e) => s.setMap(e.target.value)} disabled={readOnly} className="mt-1 w-full rounded border border-line bg-ink px-2 py-1">
              {MAPS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Andares">
            {map.floors.map((f) => (
              <button key={f.id} role="tab" aria-selected={f.id === s.floorId} onClick={() => s.setFloor(f.id)} className={`btn ${f.id === s.floorId ? 'btn-on' : ''}`}>{f.name}</button>
            ))}
          </div>

          {!readOnly && (
            <>
              <div className="grid grid-cols-2 gap-1">
                {TOOLS.map((t) => (
                  <button key={t.id} title={t.hint} onClick={() => s.setTool(t.id)} className={`btn ${s.tool === t.id ? 'btn-on' : ''}`}>{t.label}</button>
                ))}
              </div>
              <div className="flex gap-2" aria-label="Cor">
                {COLORS.map((c) => (
                  <button key={c} aria-label={`Cor ${c}`} onClick={() => s.setColor(c)} style={{ background: c }} className={`h-6 w-6 rounded-full border-2 ${s.color === c ? 'border-white' : 'border-transparent'}`} />
                ))}
              </div>
              <div>
                <div className="mb-2 flex gap-1">
                  <button className={`btn flex-1 ${s.side === 'atk' ? 'btn-on' : ''}`} onClick={() => s.setSide('atk')}>Ataque</button>
                  <button className={`btn flex-1 ${s.side === 'def' ? 'btn-on' : ''}`} onClick={() => s.setSide('def')}>Defesa</button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {OPERATORS[s.side].map((o) => (
                    <button key={o} onClick={() => s.pickOperator(o)} className={`btn text-xs ${s.pending === o ? 'btn-on' : ''}`}>{o}</button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">Escolha um operador e clique no mapa para posicioná-lo.</p>
              </div>
            </>
          )}
        </aside>
        <main className="min-w-0 flex-1">
          <StratCanvas stageRef={stageRef} readOnly={readOnly} />
        </main>
      </div>
    </div>
  );
}

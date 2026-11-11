import { create } from 'zustand';
import type { Item, Scene, Side, StratData, Tool } from './types';
import { MAPS, getMap, startFloor } from './maps';

type S = {
  title: string;
  mapId: string;
  floorId: string;
  scene: Scene;
  tool: Tool;
  color: string;
  side: Side;
  pending: string | null; // operador escolhido na paleta, aguardando clique no mapa
  past: Scene[];
  future: Scene[];
  setTitle: (t: string) => void;
  setMap: (id: string) => void;
  setFloor: (id: string) => void;
  setTool: (t: Tool) => void;
  setColor: (c: string) => void;
  setSide: (s: Side) => void;
  pickOperator: (name: string) => void;
  add: (i: Item) => void;
  update: (id: string, patch: Partial<Item>) => void;
  remove: (id: string) => void;
  clearFloor: () => void;
  undo: () => void;
  redo: () => void;
  load: (d: StratData) => void;
};

const MAX_HISTORY = 50;

export const useStrat = create<S>((set, get) => {
  /** Aplica uma mudança no andar atual guardando o estado anterior para desfazer. */
  const mutate = (fn: (items: Item[]) => Item[]) => {
    const { scene, floorId, past } = get();
    const next: Scene = { ...scene, [floorId]: fn(scene[floorId] ?? []) };
    set({ scene: next, past: [...past.slice(-(MAX_HISTORY - 1)), scene], future: [] });
  };

  return {
    title: 'Nova strat',
    mapId: MAPS[0].id,
    floorId: startFloor(MAPS[0]),
    scene: {},
    tool: 'select',
    color: '#f2b134',
    side: 'atk',
    pending: null,
    past: [],
    future: [],
    setTitle: (title) => set({ title }),
    setMap: (id) => set({ mapId: id, floorId: startFloor(getMap(id)), scene: {}, past: [], future: [] }),
    setFloor: (floorId) => set({ floorId }),
    setTool: (tool) => set({ tool, pending: tool === 'operator' ? get().pending : null }),
    setColor: (color) => set({ color }),
    setSide: (side) => set({ side, pending: null }),
    pickOperator: (name) => set({ pending: name, tool: 'operator' }),
    add: (i) => mutate((items) => [...items, i]),
    update: (id, patch) => mutate((items) => items.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    remove: (id) => mutate((items) => items.filter((i) => i.id !== id)),
    clearFloor: () => mutate(() => []),
    undo: () => {
      const { past, future, scene } = get();
      if (!past.length) return;
      set({ scene: past[past.length - 1], past: past.slice(0, -1), future: [scene, ...future] });
    },
    redo: () => {
      const { past, future, scene } = get();
      if (!future.length) return;
      set({ scene: future[0], future: future.slice(1), past: [...past, scene] });
    },
    load: ({ title, mapId, scene }) =>
      set({ title, mapId, scene, floorId: startFloor(getMap(mapId)), past: [], future: [], tool: 'select' }),
  };
});

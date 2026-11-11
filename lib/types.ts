export type Tool = 'select' | 'path' | 'arrow' | 'rotation' | 'operator' | 'reinforce' | 'breach' | 'drone' | 'note' | 'erase';
export type Side = 'atk' | 'def';
export type ItemType = 'operator' | 'path' | 'arrow' | 'rotation' | 'reinforce' | 'breach' | 'drone' | 'note';

export type Item = {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  points?: number[];
  label?: string;
  side?: Side;
  color?: string;
  rotation?: number;
};

/** floorId -> itens daquele andar. É exatamente isso que vai para o banco (coluna jsonb). */
export type Scene = Record<string, Item[]>;

export type StratData = { title: string; mapId: string; scene: Scene };

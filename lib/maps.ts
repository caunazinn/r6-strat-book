// Gerado a partir dos blueprints em /public/maps/<mapa>/<andar>.webp.
// Para adicionar um mapa: coloque as imagens na pasta e inclua uma entrada aqui.
export type Floor = { id: string; name: string; image: string };
export type GameMap = { id: string; name: string; w: number; h: number; floors: Floor[] };

const FLOOR_NAMES: Record<string, string> = { b: 'Subsolo', '1f': '1º andar', '2f': '2º andar', '3f': '3º andar', roof: 'Telhado' };
const ORDER = ['b', '1f', '2f', '3f', 'roof'];
const mk = (id: string, name: string, w: number, h: number, floors: string[]): GameMap => ({
  id, name, w, h,
  floors: [...floors].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).map((f) => ({ id: f, name: FLOOR_NAMES[f], image: `/maps/${id}/${f}.webp` })),
});

export const MAPS: GameMap[] = [
  mk('bank', "Bank", 1600, 900, ["1f", "2f", "b", "roof"]),
  mk('border', "Border", 1600, 900, ["1f", "2f", "roof"]),
  mk('kafe', "Café Dostoyevsky", 1600, 900, ["1f", "2f", "3f", "roof"]),
  mk('calypso-casino', "Calypso Casino", 2400, 1350, ["b", "1f", "2f", "roof"]),
  mk('chalet', "Chalet", 1600, 900, ["b", "1f", "2f", "roof"]),
  mk('clubhouse', "Clubhouse", 1600, 900, ["b", "1f", "2f", "roof"]),
  mk('coastline', "Coastline", 1600, 900, ["1f", "2f", "roof"]),
  mk('consulate', "Consulate", 1600, 900, ["b", "1f", "2f", "roof"]),
  mk('fortress', "Fortress", 1600, 900, ["1f", "2f", "roof"]),
  mk('kanal', "Kanal", 1600, 900, ["b", "1f", "2f", "3f", "roof"]),
  mk('lair', "Lair", 1600, 900, ["b", "1f", "2f", "roof"]),
  mk('nighthavenlabs', "Nighthaven Labs", 1600, 900, ["b", "1f", "2f", "roof"]),
  mk('oregon', "Oregon", 1600, 900, ["b", "1f", "2f", "3f", "roof"]),
  mk('outback', "Outback", 1600, 900, ["1f", "2f", "roof"]),
];

export const getMap = (id: string) => MAPS.find((m) => m.id === id) ?? MAPS[0];
/** Andar inicial: o 1º andar quando existe (é onde começa a maioria das strats). */
export const startFloor = (m: GameMap) => (m.floors.find((f) => f.id === '1f') ?? m.floors[0]).id;

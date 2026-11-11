import { supabase } from './supabase';
import type { StratData } from './types';

const slug = () => Math.random().toString(36).slice(2, 10);

export async function saveStrat(data: StratData, visibility: 'public' | 'private' = 'public') {
  if (!supabase) {
    localStorage.setItem('r6-strat-draft', JSON.stringify(data));
    return { slug: null as string | null, local: true };
  }
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Entre com seu e-mail para salvar e compartilhar.');
  const share_slug = slug();
  const { error } = await supabase.from('strats').insert({
    owner_id: u.user.id,
    title: data.title,
    map_id: data.mapId,
    scene: data.scene,
    visibility,
    share_slug,
  });
  if (error) throw new Error(error.message);
  return { slug: share_slug, local: false };
}

export async function getStratBySlug(share_slug: string): Promise<StratData> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase
    .from('strats')
    .select('title, map_id, scene')
    .eq('share_slug', share_slug)
    .single();
  if (error || !data) throw new Error('Strat não encontrada ou privada.');
  return { title: data.title, mapId: data.map_id, scene: data.scene };
}

export function loadDraft(): StratData | null {
  const raw = localStorage.getItem('r6-strat-draft');
  return raw ? (JSON.parse(raw) as StratData) : null;
}

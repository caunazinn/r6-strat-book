import type { Side } from './types';

// Lista inicial. Adicione quantos quiser: o token usa as iniciais do nome.
export const OPERATORS: Record<Side, string[]> = {
  atk: ['Ash', 'Thermite', 'Sledge', 'Thatcher', 'Twitch', 'Montagne', 'Dokkaebi', 'Zero', 'Ace', 'Hibana', 'Buck', 'Flores'],
  def: ['Jäger', 'Bandit', 'Mute', 'Rook', 'Doc', 'Kapkan', 'Smoke', 'Valkyrie', 'Mira', 'Vigil', 'Alibi', 'Echo'],
};

export const initials = (name: string) => name.slice(0, 2);

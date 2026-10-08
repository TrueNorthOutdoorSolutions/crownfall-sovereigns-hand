import type { DeckId, ItemId } from '../content/prototype';
export type Player = 0 | 1;
export type Front = 'wild' | 'throne' | 'forge';
export const FRONTS: Front[] = ['wild', 'throne', 'forge'];
export interface Unit {
  uid: number; card: string; owner: Player; front: Front; stars: 1 | 2 | 3;
  wounds: number; growth: number; item: ItemId | null;
}
export interface PlayerState { hand: string[]; deck: string[]; discard: string[]; command: number; components: number; freeMoveUsed: boolean; }
export interface FrontResult {
  front: Front; before: [number, number]; after: [number, number];
  damage: [number, number]; fallen: string[]; winner: Player | null; influence: number;
}
export interface Resolution {
  round: number; fronts: FrontResult[]; influence: [number, number];
  from: number; to: number; claim: Player | null; winner: Player | null;
}
export interface GameState {
  version: 1; seed: number; initialSeed: number; deckIds: [DeckId, DeckId];
  round: number; active: Player; initiative: Player; passes: number;
  players: [PlayerState, PlayerState]; units: Unit[]; nextUid: number;
  crown: number; claim: Player | null; winner: Player | null;
  phase: 'planning' | 'resolution' | 'finished'; lastResolution: Resolution | null;
  log: string[]; history: Action[];
}
export type Action =
  | { type: 'deploy'; handIndex: number; front: Front }
  | { type: 'ascend'; handIndex: number; uid: number }
  | { type: 'move'; uid: number; front: Front }
  | { type: 'equip'; uid: number; item: ItemId }
  | { type: 'pass' }
  | { type: 'continue' };

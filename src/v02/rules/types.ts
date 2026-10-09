import type { DeckId, Effect } from '../content/cards';

export type PlayerIndex = 0 | 1;
export type Phase = 'mulligan' | 'main' | 'battle' | 'after' | 'over';

export interface ChampionInPlay {
  uid: number;
  owner: PlayerIndex;
  /** Card ids, bottom (★) first; the last entry is the current form. */
  stack: string[];
  exhausted: boolean;
  arrivedTurn: number;
  ascendedTurn: number;
  shield: boolean;
  /** "This turn" changes, cleared at the end of every turn. */
  mods: { might: number; guard: number };
  blocking: boolean;
  noAttack: boolean;
  readiedTurn: number;
  /** Attached Relic card id. */
  relic?: string | null;
  /** Summoned token: it vanishes when defeated instead of going to the Fallen pile. */
  token?: boolean;
}

export interface SetScheme { sid: number; card: string; setTurn: number }

export interface PlayerState {
  deckId: DeckId;
  deck: string[];
  hand: string[];
  crown: string[];
  fallen: string[];
  ascension: string[];
  field: ChampionInPlay[];
  schemes: SetScheme[];
  command: number;
  commandMax: number;
  ascendedOnTurn: number;
  mulliganed: boolean;
  /** The Edict this player owns that is currently in play. */
  edictCard?: string | null;
  /** Extra Champion Zones gained this game (Prodigy's Path and similar). */
  extraZones?: number;
  cycledOnTurn?: number;
}

export type CombatStage = 'declared' | 'block' | 'respondDefender' | 'respondAttacker' | 'clash';

export interface Combat {
  attacker: number;
  attackerOwner: PlayerIndex;
  target: 'crown' | number;
  defender: number | null;
  stage: CombatStage;
  /** The attacked champion was sideways when the attack was declared (for Ambush). */
  targetWasExhausted: boolean;
  /** "Attack: … the defender" effects waiting for the defender to be known. */
  defenderEffects: Effect[];
}

export interface EffectContext { attacker?: number; defender?: number }

/** A step waiting in the effect queue: a card effect, or an internal turn step. */
export type QueueItem =
  | { kind: 'effect'; effect: Effect; controller: PlayerIndex; source: string; self?: number; ctx?: EffectContext }
  | { kind: 'breakShard'; player: PlayerIndex; reason: 'attack' | 'breakthrough' | 'stall' | 'deckout' | 'sacrifice' }
  | { kind: 'draw'; player: PlayerIndex }
  | { kind: 'refill'; player: PlayerIndex }
  | { kind: 'enterMain' };

export interface ChoiceOption { key: string; label: string }

export type Pending =
  | { kind: 'mulligan'; player: PlayerIndex }
  | { kind: 'choose'; player: PlayerIndex; prompt: string; options: ChoiceOption[]; optional: boolean; item: Extract<QueueItem, { kind: 'effect' }> }
  | { kind: 'block'; player: PlayerIndex; options: number[] }
  | { kind: 'respond'; player: PlayerIndex; options: ChoiceOption[] }
  | { kind: 'shardfall'; player: PlayerIndex; card: string }
  | { kind: 'discard'; player: PlayerIndex; count: number };

export type LogKind = 'turn' | 'play' | 'ascend' | 'attack' | 'clash' | 'shard' | 'scheme' | 'effect' | 'info' | 'win';

export interface LogEntry { n: number; turn: number; player: PlayerIndex | null; kind: LogKind; text: string }

export interface ClashReport {
  n: number;
  attacker: string;
  defender: string;
  attackerMight: number;
  attackerGuard: number;
  defenderMight: number;
  defenderGuard: number;
  attackerDefeated: boolean;
  defenderDefeated: boolean;
  notes: string[];
}

export interface GameState {
  rulesVersion: string;
  seed: number;
  rng: number;
  first: PlayerIndex;
  turn: number;
  active: PlayerIndex;
  phase: Phase;
  players: [PlayerState, PlayerState];
  combat: Combat | null;
  queue: QueueItem[];
  pending: Pending | null;
  ending: boolean;
  winner: PlayerIndex | null;
  endReason: string | null;
  nextUid: number;
  log: LogEntry[];
  lastClash: ClashReport | null;
  /** The shared Edict in play. */
  edict?: { card: string; owner: PlayerIndex } | null;
  /** Turn on which War Banners last paid out. */
  bannerTurn?: number;
  /** Shards broken this game by each player's attacks (for the results screen). */
  stats: { shardsBroken: [number, number]; ascends: [number, number]; schemes: [number, number] };
}

export type Action =
  | { type: 'mulligan'; redraw: boolean }
  | { type: 'deploy'; handIndex: number }
  | { type: 'cast'; handIndex: number }
  | { type: 'setScheme'; handIndex: number }
  | { type: 'equip'; handIndex: number; uid: number }
  | { type: 'playEdict'; handIndex: number }
  | { type: 'cycle'; handIndex: number }
  | { type: 'ascend'; uid: number }
  | { type: 'toBattle' }
  | { type: 'attack'; uid: number; target: 'crown' | number }
  | { type: 'endBattle' }
  | { type: 'endTurn' }
  | { type: 'choose'; key: string | null }
  | { type: 'block'; uid: number | null }
  | { type: 'respond'; key: string | null }
  | { type: 'shardfall'; use: boolean }
  | { type: 'discard'; handIndex: number };

export interface ApplyResult { state: GameState; error: string | null }

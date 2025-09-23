export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
}

export interface Lobby {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameType: GameType;
  isStarted: boolean;
  hostId: string;
}

export interface Card {
  id: string;
  suit: string;
  value: string;
  displayValue: string;
}

export interface GameState {
  currentPlayer: string;
  deck: Card[];
  currentCard: Card | null; // Changed from Card | undefined to Card | null
  gamePhase: 'round1' | 'round2' | 'round3' | 'round4' | 'bus' | 'finished';
  busLevel: number;
  players: { [playerId: string]: PlayerGameState };
  currentRound: number;
  currentPlayerIndex: number;
}

export interface PlayerGameState {
  cards: Card[];
  lives: number;
  drinks: number;
}

export type GameType = 'bussen' | 'waterval' | 'kings';

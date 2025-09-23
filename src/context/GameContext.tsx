import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Player, Lobby, GameState } from '../types';

interface GameContextType {
  currentPlayer: Player | null;
  currentLobby: Lobby | null;
  gameState: GameState | null;
  setCurrentPlayer: (player: Player) => void;
  setCurrentLobby: (lobby: Lobby) => void;
  setGameState: (gameState: GameState) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

interface State {
  currentPlayer: Player | null;
  currentLobby: Lobby | null;
  gameState: GameState | null;
}

type Action = 
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_LOBBY'; payload: Lobby }
  | { type: 'SET_GAME_STATE'; payload: GameState };

const gameReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'SET_LOBBY':
      return { ...state, currentLobby: action.payload };
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    default:
      return state;
  }
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    currentPlayer: null,
    currentLobby: null,
    gameState: null,
  });

  const setCurrentPlayer = (player: Player) => {
    dispatch({ type: 'SET_PLAYER', payload: player });
  };

  const setCurrentLobby = (lobby: Lobby) => {
    dispatch({ type: 'SET_LOBBY', payload: lobby });
  };

  const setGameState = (gameState: GameState) => {
    dispatch({ type: 'SET_GAME_STATE', payload: gameState });
  };

  return (
    <GameContext.Provider value={{
      ...state,
      setCurrentPlayer,
      setCurrentLobby,
      setGameState,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

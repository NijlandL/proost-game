import { Card, GameState, Player } from '../types';
import { LobbyService } from './LobbyService';

export class GameService {
  static createDeck(): Card[] {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    suits.forEach(suit => {
      values.forEach(value => {
        deck.push({
          id: `${suit}-${value}`,
          suit,
          value,
          displayValue: `${value}${suit}`
        });
      });
    });

    return this.shuffleDeck(deck);
  }

  static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static initializeGameState(players: Player[]): GameState {
    const deck = this.createDeck();
    const playerGameStates: { [playerId: string]: any } = {};

    players.forEach(player => {
      playerGameStates[player.id] = {
        cards: [],
        lives: 3,
        drinks: 0
      };
    });

    return {
      currentPlayer: players[0].id,
      deck,
      currentCard: null, // Changed from undefined to null
      gamePhase: 'round1',
      busLevel: 1,
      players: playerGameStates,
      currentRound: 1,
      currentPlayerIndex: 0
    };
  }

  static drawCard(gameState: GameState): { card: Card; newGameState: GameState } {
    const newDeck = [...gameState.deck];
    const card = newDeck.pop();
    
    if (!card) {
      throw new Error('Deck is leeg!');
    }

    const newGameState = {
      ...gameState,
      deck: newDeck,
      currentCard: card // This will now be a Card object, not undefined
    };

    return { card, newGameState };
  }

  static checkBussenGuess(guess: string, card: Card, playerCards: Card[], round: number): boolean {
    switch (round) {
      case 1:
        // Ronde 1: Rood of Zwart
        if (guess === 'red') {
          return card.suit === '♥️' || card.suit === '♦️';
        } else if (guess === 'black') {
          return card.suit === '♠️' || card.suit === '♣️';
        }
        return false;

      case 2:
        // Ronde 2: Hoger of Lager dan eerste kaart
        if (playerCards.length === 0) return false;
        const firstCardValue = this.getCardNumericValue(playerCards[0]);
        const newCardValue = this.getCardNumericValue(card);
        
        if (guess === 'higher') {
          return newCardValue > firstCardValue;
        } else if (guess === 'lower') {
          return newCardValue < firstCardValue;
        }
        return false;

      case 3:
        // Ronde 3: Binnen of Buiten de twee kaarten
        if (playerCards.length < 2) return false;
        const card1Value = this.getCardNumericValue(playerCards[0]);
        const card2Value = this.getCardNumericValue(playerCards[1]);
        const newValue = this.getCardNumericValue(card);
        
        const minValue = Math.min(card1Value, card2Value);
        const maxValue = Math.max(card1Value, card2Value);
        
        if (guess === 'inside') {
          return newValue > minValue && newValue < maxValue;
        } else if (guess === 'outside') {
          return newValue < minValue || newValue > maxValue;
        }
        return false;

      case 4:
        // Ronde 4: Soort al hebben of niet
        const hasSuit = playerCards.some(c => c.suit === card.suit);
        
        if (guess === 'have') {
          return hasSuit;
        } else if (guess === 'not_have') {
          return !hasSuit;
        }
        return false;

      default:
        return false;
    }
  }

  static getCardNumericValue(card: Card): number {
    switch (card.value) {
      case 'A': return 1;
      case 'J': return 11;
      case 'Q': return 12;
      case 'K': return 13;
      default: return parseInt(card.value);
    }
  }

  static saveGameState(lobbyId: string, gameState: GameState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`proost_game_${lobbyId}`, JSON.stringify(gameState));
  }

  static getGameState(lobbyId: string): GameState | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`proost_game_${lobbyId}`);
    return stored ? JSON.parse(stored) : null;
  }

  static async initializeGame(lobbyId: string, players: Player[]): Promise<GameState> {
    console.log('Creating initial game state for players:', players);
    const gameState = this.initializeGameState(players);
    console.log('Initial game state:', gameState);
    
    try {
      await LobbyService.updateGameState(lobbyId, gameState);
      console.log('Game state saved to Firebase');
      return gameState;
    } catch (error) {
      console.error('Error saving game state:', error);
      throw error;
    }
  }

  static async makeMove(lobbyId: string, gameState: GameState, playerId: string, guess: string, playerCards: Card[], round: number): Promise<{ card: Card; isCorrect: boolean; newGameState: GameState }> {
    const { card, newGameState } = this.drawCard(gameState);
    const isCorrect = this.checkBussenGuess(guess, card, playerCards, round);
    
    // Add card to player's cards
    newGameState.players[playerId].cards.push(card);
    
    if (!isCorrect) {
      newGameState.players[playerId].drinks += 1;
    }

    // Save to Firebase
    await LobbyService.updateGameState(lobbyId, newGameState);
    
    return { card, isCorrect, newGameState };
  }

  static async nextPlayer(lobbyId: string, gameState: GameState, totalPlayers: number): Promise<GameState> {
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % totalPlayers;
    const newGameState = { ...gameState };
    
    newGameState.currentPlayerIndex = nextPlayerIndex;
    
    // Check if round is complete
    if (nextPlayerIndex === 0) {
      const nextRound = gameState.currentRound + 1;
      if (nextRound <= 4) {
        newGameState.currentRound = nextRound;
        newGameState.gamePhase = `round${nextRound}` as any;
      } else {
        newGameState.gamePhase = 'finished';
      }
    }

    await LobbyService.updateGameState(lobbyId, newGameState);
    return newGameState;
  }
}

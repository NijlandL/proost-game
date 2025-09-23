import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { GameService } from '../services/GameService';
import { LobbyService } from '../services/LobbyService';
import { Card, GameState } from '../types';

const GameScreen = ({ route }: any) => {
  const { lobbyId } = route.params || {};
  const { currentLobby, currentPlayer } = useGame();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!lobbyId || !currentLobby) return;

    console.log('Initializing game for lobby:', lobbyId);

    // Initialize game state
    const initGame = async () => {
      try {
        await GameService.initializeGame(lobbyId, currentLobby.players);
        console.log('Game initialized');
      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };

    initGame();

    // Listen to game state changes
    const unsubscribe = LobbyService.listenToGameState(lobbyId, (updatedGameState) => {
      console.log('Game state updated:', updatedGameState);
      setGameState(updatedGameState);
    });

    return unsubscribe;
  }, [lobbyId, currentLobby]);

  const makeGuess = async (guess: string) => {
    if (!gameState || !currentLobby || !currentPlayer || isProcessing) return;

    const currentPlayerId = currentLobby.players[gameState.currentPlayerIndex]?.id;
    if (currentPlayerId !== currentPlayer.id) {
      Alert.alert('Niet jouw beurt!', 'Wacht tot je aan de beurt bent.');
      return;
    }

    setIsProcessing(true);

    try {
      const playerCards = gameState.players[currentPlayer.id].cards;
      const { card, isCorrect, newGameState } = await GameService.makeMove(
        lobbyId, 
        gameState, 
        currentPlayer.id, 
        guess, 
        playerCards, 
        gameState.currentRound
      );
      
      let message = `${card.displayValue} - `;
      if (isCorrect) {
        message += 'Goed geraden! 🎉';
      } else {
        message += 'Fout! Drink! 🍺';
      }

      Alert.alert('Resultaat', message, [
        { 
          text: 'OK', 
          onPress: async () => {
            await GameService.nextPlayer(lobbyId, newGameState, currentLobby.players.length);
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Er ging iets mis. Probeer opnieuw.');
      console.error('Game error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoundTitle = () => {
    if (!gameState) return 'Bussen';
    
    switch (gameState.currentRound) {
      case 1: return 'Ronde 1: Rood of Zwart?';
      case 2: return 'Ronde 2: Hoger of Lager?';
      case 3: return 'Ronde 3: Binnen of Buiten?';
      case 4: return 'Ronde 4: Kleur al hebben?';
      default: return 'Spel Afgelopen!';
    }
  };

  const getRoundButtons = () => {
    if (!gameState) return null;

    const currentPlayerId = currentLobby?.players[gameState.currentPlayerIndex]?.id;
    const isMyTurn = currentPlayerId === currentPlayer?.id;
    
    if (!isMyTurn) {
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Wacht op andere spelers...</Text>
        </View>
      );
    }

    const buttonStyle = isProcessing ? [styles.gameButton, styles.disabledButton] : styles.gameButton;

    switch (gameState.currentRound) {
      case 1:
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[buttonStyle, styles.redButton]} 
              onPress={() => makeGuess('red')}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Rood ♥️♦️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[buttonStyle, styles.blackButton]} 
              onPress={() => makeGuess('black')}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>Zwart ♠️♣️</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.gameButton, styles.higherButton]} onPress={() => makeGuess('higher')}>
              <Text style={styles.buttonText}>Hoger ⬆️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gameButton, styles.lowerButton]} onPress={() => makeGuess('lower')}>
              <Text style={styles.buttonText}>Lager ⬇️</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.gameButton, styles.insideButton]} onPress={() => makeGuess('inside')}>
              <Text style={styles.buttonText}>Binnen 📥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gameButton, styles.outsideButton]} onPress={() => makeGuess('outside')}>
              <Text style={styles.buttonText}>Buiten 📤</Text>
            </TouchableOpacity>
          </View>
        );
      case 4:
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.gameButton, styles.haveButton]} onPress={() => makeGuess('have')}>
              <Text style={styles.buttonText}>Heb ik al ✅</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.gameButton, styles.notHaveButton]} onPress={() => makeGuess('not_have')}>
              <Text style={styles.buttonText}>Heb ik niet ❌</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>🎉 Spel Afgelopen! 🎉</Text>
            <Text style={styles.gameOverSubtext}>Bedankt voor het spelen!</Text>
          </View>
        );
    }
  };

  if (!currentLobby || !gameState) {
    return (
      <View style={styles.container}>
        <Text>Loading game...</Text>
        <Text style={styles.debugText}>
          Lobby: {currentLobby ? 'OK' : 'Missing'} | 
          Game State: {gameState ? 'OK' : 'Missing'}
        </Text>
      </View>
    );
  }

  const currentPlayerName = currentLobby.players[gameState.currentPlayerIndex]?.name || 'Onbekend';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍻 Bussen 🍻</Text>
      <Text style={styles.roundTitle}>{getRoundTitle()}</Text>
      
      <View style={styles.currentPlayerContainer}>
        <Text style={styles.currentPlayerText}>
          Aan de beurt: {currentPlayerName}
        </Text>
      </View>

      <Text style={styles.instruction}>
        Kaarten over: {gameState.deck.length}
      </Text>

      {getRoundButtons()}

      {gameState.currentCard && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardText}>Vorige kaart:</Text>
          <Text style={styles.card}>{gameState.currentCard.displayValue}</Text>
        </View>
      )}

      <View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>Spelers:</Text>
        {currentLobby.players.map((player, index) => {
          const playerState = gameState.players[player.id];
          const playerCards = playerState?.cards || [];
          return (
            <View key={player.id} style={[
              styles.playerItem,
              index === gameState.currentPlayerIndex && styles.activePlayer
            ]}>
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerCards}>
                  Kaarten: {playerCards.map(c => c.displayValue).join(', ') || 'Geen'}
                </Text>
              </View>
              <Text style={styles.playerStats}>
                🍺 {playerState?.drinks || 0}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  currentPlayerContainer: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  currentPlayerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    fontSize: 48,
    fontWeight: 'bold',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    minWidth: 100,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  gameButton: {
    backgroundColor: '#4ecdc4',
    padding: 20,
    borderRadius: 10,
    minWidth: 120,
  },
  redButton: {
    backgroundColor: '#e74c3c',
  },
  blackButton: {
    backgroundColor: '#2c3e50',
  },
  higherButton: {
    backgroundColor: '#27ae60',
  },
  lowerButton: {
    backgroundColor: '#f39c12',
  },
  insideButton: {
    backgroundColor: '#28a745',
  },
  outsideButton: {
    backgroundColor: '#dc3545',
  },
  haveButton: {
    backgroundColor: '#17a2b8',
  },
  notHaveButton: {
    backgroundColor: '#6f42c1',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playersContainer: {
    flex: 1,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 8,
  },
  activePlayer: {
    backgroundColor: '#fff3cd',
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerStats: {
    fontSize: 14,
    color: '#666',
  },
  waitingContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  waitingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  gameOverContainer: {
    backgroundColor: '#d4edda',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#155724',
  },
  gameOverSubtext: {
    fontSize: 16,
    color: '#155724',
    marginTop: 10,
  },
  playerCards: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default GameScreen;

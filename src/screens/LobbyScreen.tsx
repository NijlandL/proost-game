import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { LobbyService } from '../services/LobbyService';
import { Lobby, Player } from '../types';

const LobbyScreen = ({ route, navigation }: any) => {
  const { lobbyId } = route.params;
  const { currentPlayer, setCurrentLobby } = useGame();
  const [lobby, setLobby] = useState<Lobby | null>(null);

  useEffect(() => {
    const unsubscribe = LobbyService.listenToLobby(lobbyId, (updatedLobby) => {
      if (!updatedLobby) {
        // Lobby was deleted, go back to home
        Alert.alert('Lobby gesloten', 'De lobby is gesloten door de host.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
        return;
      }
      
      setLobby(updatedLobby);
      setCurrentLobby(updatedLobby);
      
      if (updatedLobby.isStarted) {
        navigation.navigate('Game', { lobbyId });
      }
    });

    // Cleanup when leaving lobby
    return () => {
      unsubscribe();
      if (currentPlayer && lobby && !lobby.isStarted) {
        LobbyService.leaveLobby(lobbyId, currentPlayer.id);
      }
    };
  }, [lobbyId]);

  const shareLobbyCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Proost! Lobby',
          text: `Join mijn Proost! lobby met code: ${lobbyId}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(lobbyId);
        alert(`Lobby code ${lobbyId} gekopieerd naar clipboard!`);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Manual fallback
      alert(`Deel deze code met je vrienden: ${lobbyId}`);
    }
  };

  const startGame = async () => {
    if (lobby && currentPlayer?.isHost) {
      await LobbyService.startGame(lobbyId);
    }
  };

  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerItem}>
      <Text style={styles.playerName}>{item.name}</Text>
      {item.isHost && <Text style={styles.hostBadge}>Host</Text>}
    </View>
  );

  if (!lobby) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lobby.name}</Text>
      <Text style={styles.lobbyCode}>Code: {lobbyId}</Text>
      
      <TouchableOpacity style={styles.shareButton} onPress={shareLobbyCode}>
        <Text style={styles.shareButtonText}>Deel Code</Text>
      </TouchableOpacity>
      
      <Text style={styles.playersTitle}>
        Spelers ({lobby.players.length}/{lobby.maxPlayers})
      </Text>
      
      <FlatList
        data={lobby.players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        style={styles.playersList}
      />
      
      {currentPlayer?.isHost && lobby.players.length >= 2 && (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Spel</Text>
        </TouchableOpacity>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  lobbyCode: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  shareButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  shareButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 8,
  },
  playerName: {
    fontSize: 16,
  },
  hostBadge: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  startButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LobbyScreen;

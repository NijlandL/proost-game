import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { LobbyService } from '../services/LobbyService';

const HomeScreen = ({ navigation }: any) => {
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const { setCurrentPlayer } = useGame();

  const createLobby = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Voer een naam in!');
      return;
    }
    
    const player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      isHost: true,
    };
    
    setCurrentPlayer(player);
    const lobby = await LobbyService.createLobby(player);
    navigation.navigate('Lobby', { lobbyId: lobby.id });
  };

  const joinLobby = async () => {
    if (!playerName.trim() || !lobbyCode.trim()) {
      Alert.alert('Error', 'Voer een naam en lobby code in!');
      return;
    }
    
    const player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      isHost: false,
    };
    
    try {
      setCurrentPlayer(player);
      await LobbyService.joinLobby(lobbyCode.toUpperCase(), player);
      navigation.navigate('Lobby', { lobbyId: lobbyCode.toUpperCase() });
    } catch (error) {
      Alert.alert('Error', error.message || 'Kon niet deelnemen aan lobby');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proost! 🍻</Text>
      <Text style={styles.subtitle}>Drankspellen voor vrienden</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Jouw naam"
        value={playerName}
        onChangeText={setPlayerName}
      />
      
      <TouchableOpacity style={styles.button} onPress={createLobby}>
        <Text style={styles.buttonText}>Nieuwe Lobby</Text>
      </TouchableOpacity>
      
      <View style={styles.divider}>
        <Text style={styles.dividerText}>OF</Text>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Lobby Code (bijv. ABC123)"
        value={lobbyCode}
        onChangeText={setLobbyCode}
        autoCapitalize="characters"
      />
      
      <TouchableOpacity style={[styles.button, styles.joinButton]} onPress={joinLobby}>
        <Text style={styles.buttonText}>Join Lobby</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    color: '#999',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#4ecdc4',
  },
});

export default HomeScreen;

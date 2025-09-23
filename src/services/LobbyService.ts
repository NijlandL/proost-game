import { ref, push, set, onValue, off, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { Lobby, Player } from '../types';

class FirebaseLobbyService {
  static async createLobby(host: Player): Promise<Lobby> {
    const lobbyId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const lobbyRef = ref(database, `lobbies/${lobbyId}`);
    
    const lobby: Lobby = {
      id: lobbyId,
      name: `${host.name}'s Lobby`,
      players: [host],
      maxPlayers: 8,
      gameType: 'bussen',
      isStarted: false,
      hostId: host.id,
    };
    
    await set(lobbyRef, lobby);
    return lobby;
  }

  static async joinLobby(lobbyId: string, player: Player): Promise<void> {
    const lobbyRef = ref(database, `lobbies/${lobbyId}`);
    
    return new Promise((resolve, reject) => {
      onValue(lobbyRef, (snapshot) => {
        const lobby = snapshot.val();
        if (!lobby) {
          reject(new Error('Lobby bestaat niet'));
          return;
        }
        
        if (lobby.players.length >= lobby.maxPlayers) {
          reject(new Error('Lobby is vol'));
          return;
        }

        // Check if player name already exists
        const existingPlayer = lobby.players.find((p: Player) => p.name === player.name);
        if (existingPlayer) {
          reject(new Error('Er is al een speler met deze naam in de lobby'));
          return;
        }

        const updatedPlayers = [...lobby.players, player];
        update(lobbyRef, { players: updatedPlayers }).then(() => {
          resolve();
        }).catch(reject);
      }, { onlyOnce: true });
    });
  }

  static listenToLobby(lobbyId: string, callback: (lobby: Lobby | null) => void): () => void {
    const lobbyRef = ref(database, `lobbies/${lobbyId}`);
    
    onValue(lobbyRef, (snapshot) => {
      const lobby = snapshot.val();
      callback(lobby);
    });

    return () => off(lobbyRef);
  }

  static async startGame(lobbyId: string): Promise<void> {
    const lobbyRef = ref(database, `lobbies/${lobbyId}`);
    await update(lobbyRef, { isStarted: true });
  }

  static async updateGameState(lobbyId: string, gameState: any): Promise<void> {
    const gameRef = ref(database, `games/${lobbyId}`);
    await set(gameRef, gameState);
  }

  static listenToGameState(lobbyId: string, callback: (gameState: any) => void): () => void {
    const gameRef = ref(database, `games/${lobbyId}`);
    
    onValue(gameRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        callback(gameState);
      }
    });

    return () => off(gameRef);
  }

  static async leaveLobby(lobbyId: string, playerId: string): Promise<void> {
    const lobbyRef = ref(database, `lobbies/${lobbyId}`);
    
    return new Promise((resolve, reject) => {
      onValue(lobbyRef, (snapshot) => {
        const lobby = snapshot.val();
        if (!lobby) {
          resolve();
          return;
        }

        const updatedPlayers = lobby.players.filter((p: Player) => p.id !== playerId);
        
        if (updatedPlayers.length === 0) {
          // Delete lobby if no players left
          remove(lobbyRef).then(resolve).catch(reject);
        } else {
          // If host left, make first remaining player the host
          if (lobby.hostId === playerId && updatedPlayers.length > 0) {
            updatedPlayers[0].isHost = true;
            update(lobbyRef, { 
              players: updatedPlayers,
              hostId: updatedPlayers[0].id 
            }).then(resolve).catch(reject);
          } else {
            update(lobbyRef, { players: updatedPlayers }).then(resolve).catch(reject);
          }
        }
      }, { onlyOnce: true });
    });
  }
}

export { FirebaseLobbyService as LobbyService };
 

import type { GameState, Lobby, Player } from '../models/Game';
import type { Language } from './WordSource';

export interface GameApi {
	// Lobby operations
	createLobby(
		nickname: string,
		rounds: number,
		language: Language,
	): Promise<{ playerId: string; lobbyId: string }>;
	joinLobby(lobbyId: string, nickname: string): Promise<{ playerId: string }>;
	leaveLobby(playerId: string, lobbyId: string): Promise<void>;

	// Game flow operations
	startGame(lobbyId: string): Promise<void>;
	advancePhase(lobbyId: string): Promise<void>;

	// Game actions
	submitDefinition(
		playerId: string,
		definition: string,
		lobbyId: string,
	): Promise<void>;
	voteDefinition(
		playerId: string,
		definitionId: string,
		lobbyId: string,
	): Promise<void>;

	// State management
	getGameState(playerId: string, lobbyId: string): Promise<GameState>;
	reconnect(playerId: string, lobbyId: string): Promise<GameState>;
	disconnect(playerId: string, lobbyId: string): Promise<void>;

	// Game data
	getNewWord(lobbyId: string): Promise<{ word: string; definition: string }>;
	updateScores(players: Player[], lobbyId: string): Promise<void>;

	// Lobby discovery
	getLobbies(): Promise<Lobby[]>;
}

// GameState will be defined in models/Game.ts

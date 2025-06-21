import type { Language } from '../api/WordSource';

export type GamePhase = 'lobby' | 'definition' | 'voting' | 'results';

export interface Lobby {
	id: string; // 4-character alphanumeric code
	name: string;
	players: Player[];
	phase: GamePhase;
	currentWord: string | null;
	definitions: Definition[];
	round: number;
	phaseExpiration: number | null;
	correctDefinition: string;
	usedWords: string[];
	currentRound: number;
	totalRounds: number;
	votes: { playerId: string; definitionId: string }[];
	language: Language; // Language for the game words
}

export interface Player {
	id: string;
	nickname: string;
	score: number;
	connected: boolean;
}

export interface Definition {
	id: string;
	playerId: string;
	text: string;
	votes: string[]; // playerIds who voted for this definition
	isCorrect: boolean;
}

export interface GameState {
	phase: GamePhase;
	players: Player[];
	currentWord: string | null;
	definitions: Definition[];
	round: number;
	selfId: string;
	timeLeft: number; // seconds
	currentRound: number;
	correctDefinition: string;
	votes: { playerId: string; definitionId: string }[];
	totalRounds: number;
	lobbyId: string; // Add lobby ID to game state
	language: Language;
}

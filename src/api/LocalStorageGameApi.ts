import { v4 as uuid } from 'uuid';
import type { Definition, GameState, Lobby, Player } from '../models/Game';
import type { GameApi } from './GameApi';
import { SimpleWordSource } from './SimpleWordSource';
import type { Language } from './WordSource';

const LOBBIES_STORAGE_KEY = 'dico-game-lobbies';
const POLL_INTERVAL = 1000; // Poll every second

class LocalStorageGameApiImpl implements GameApi {
	private wordSource = new SimpleWordSource();
	private lastLobbiesState: string | null = null;
	private pollInterval: number | null = null;
	private isUpdating: boolean = false;

	constructor() {
		this.initializeStorage();
		this.startPolling();
	}

	private generateLobbyId(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 4; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	private startPolling() {
		if (this.pollInterval) return;

		this.pollInterval = window.setInterval(() => {
			if (this.isUpdating) return;

			const currentState = localStorage.getItem(LOBBIES_STORAGE_KEY);
			if (currentState !== this.lastLobbiesState) {
				this.lastLobbiesState = currentState;
				this.notifyStateChange();
			}
		}, POLL_INTERVAL);
	}

	private notifyStateChange() {
		window.dispatchEvent(
			new CustomEvent('dicoGameStateChanged', {
				detail: { timestamp: Date.now() },
			}),
		);
	}

	private initializeStorage() {
		const stored = localStorage.getItem(LOBBIES_STORAGE_KEY);
		if (!stored) {
			const initialLobbies: Lobby[] = [];
			localStorage.setItem(LOBBIES_STORAGE_KEY, JSON.stringify(initialLobbies));
			this.lastLobbiesState = JSON.stringify(initialLobbies);
		} else {
			this.lastLobbiesState = stored;
		}
	}

	private async getStoredLobbies(): Promise<Lobby[]> {
		const stored = localStorage.getItem(LOBBIES_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	}

	private async setLobbies(lobbies: Lobby[]): Promise<void> {
		this.isUpdating = true;
		try {
			const newStateString = JSON.stringify(lobbies);
			localStorage.setItem(LOBBIES_STORAGE_KEY, newStateString);
			this.lastLobbiesState = newStateString;
			this.notifyStateChange();
		} finally {
			setTimeout(() => {
				this.isUpdating = false;
			}, 100);
		}
	}

	private async getLobby(lobbyId: string): Promise<Lobby | null> {
		const lobbies = await this.getStoredLobbies();
		return lobbies.find((lobby) => lobby.id === lobbyId) || null;
	}

	private async updateLobby(updatedLobby: Lobby): Promise<void> {
		const lobbies = await this.getStoredLobbies();
		const index = lobbies.findIndex((lobby) => lobby.id === updatedLobby.id);
		if (index !== -1) {
			lobbies[index] = updatedLobby;
			await this.setLobbies(lobbies);
		}
	}

	private buildGameState(playerId: string, lobby: Lobby): GameState {
		const players: Player[] = lobby.players.map((p) => ({
			id: p.id,
			nickname: p.nickname,
			score: p.score,
			connected: p.connected,
		}));

		const definitions = lobby.definitions.map((d) => ({
			id: d.id,
			playerId: d.playerId,
			text: d.text,
			votes: d.votes,
			isCorrect: d.isCorrect,
		}));

		const timeLeft = lobby.phaseExpiration
			? Math.max(0, Math.floor((lobby.phaseExpiration - Date.now()) / 1000))
			: 0;

		return {
			phase: lobby.phase,
			players,
			currentWord: lobby.currentWord,
			definitions,
			round: lobby.round,
			selfId: playerId,
			timeLeft,
			currentRound: lobby.currentRound,
			correctDefinition: lobby.correctDefinition,
			votes: lobby.votes,
			totalRounds: lobby.totalRounds,
			lobbyId: lobby.id,
			language: lobby.language,
		};
	}

	public async createLobby(
		nickname: string,
		rounds: number,
		language: Language,
	): Promise<{ playerId: string; lobbyId: string }> {
		const lobbies = await this.getStoredLobbies();

		// Generate unique lobby ID
		let lobbyId: string;
		do {
			lobbyId = this.generateLobbyId();
		} while (lobbies.some((lobby) => lobby.id === lobbyId));

		const playerId = uuid();
		const newLobby: Lobby = {
			id: lobbyId,
			name: `${nickname}'s Game`,
			players: [
				{
					id: playerId,
					nickname,
					score: 0,
					connected: true,
				},
			],
			phase: 'lobby',
			currentWord: null,
			definitions: [],
			round: 1,
			phaseExpiration: null,
			correctDefinition: '',
			usedWords: [],
			currentRound: 1,
			totalRounds: rounds,
			votes: [],
			language,
		};

		lobbies.push(newLobby);
		await this.setLobbies(lobbies);

		return { playerId, lobbyId };
	}

	public async joinLobby(
		lobbyId: string,
		nickname: string,
	): Promise<{ playerId: string }> {
		const lobbies = await this.getStoredLobbies();
		const lobby = lobbies.find((l) => l.id === lobbyId);

		if (!lobby) {
			throw new Error('Lobby not found');
		}

		if (lobby.phase !== 'lobby') {
			throw new Error('Game already started');
		}

		// Check if player with same nickname already exists in this lobby
		const existingPlayer = lobby.players.find((p) => p.nickname === nickname);
		if (existingPlayer) {
			if (!existingPlayer.connected) {
				existingPlayer.connected = true;
				await this.updateLobby(lobby);
				return { playerId: existingPlayer.id };
			} else {
				throw new Error(
					'Player with this nickname already exists in this lobby',
				);
			}
		}

		// Add new player
		const playerId = uuid();
		lobby.players.push({
			id: playerId,
			nickname,
			score: 0,
			connected: true,
		});

		await this.updateLobby(lobby);
		return { playerId };
	}

	public async leaveLobby(playerId: string, lobbyId: string): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) return;

		lobby.players = lobby.players.filter((p) => p.id !== playerId);

		// If no players left, remove the lobby
		if (lobby.players.length === 0) {
			const lobbies = await this.getStoredLobbies();
			const updatedLobbies = lobbies.filter((l) => l.id !== lobbyId);
			await this.setLobbies(updatedLobbies);
		} else {
			await this.updateLobby(lobby);
		}
	}

	public async startGame(lobbyId: string): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) throw new Error('Lobby not found');
		if (lobby.phase !== 'lobby') throw new Error('Game already started');
		if (lobby.players.length < 2) throw new Error('Need at least 2 players');

		const { word, definition } = await this.wordSource.getWord(
			lobby.language,
			[],
		);

		lobby.players = lobby.players.map((player) => ({
			...player,
			score: 0,
		}));

		lobby.phase = 'definition';
		lobby.currentRound = 1;
		lobby.currentWord = word;
		lobby.correctDefinition = definition;
		lobby.definitions = [
			{
				id: uuid(),
				playerId: 'system',
				text: definition,
				votes: [],
				isCorrect: true,
			},
		];
		lobby.votes = [];
		lobby.usedWords = [word];
		lobby.phaseExpiration = Date.now() + 120 * 1000; // 2 minutes for definition

		await this.updateLobby(lobby);
	}

	public async advancePhase(lobbyId: string): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) return;

		switch (lobby.phase) {
			case 'definition':
				lobby.phase = 'voting';
				lobby.phaseExpiration = Date.now() + 120 * 1000; // 2 minutes for voting
				break;
			case 'voting':
				lobby.phase = 'results';
				lobby.phaseExpiration = Date.now() + 15 * 1000; // 15 seconds for results
				break;
			case 'results':
				if (lobby.currentRound >= lobby.totalRounds) {
					// Game is finished, return to lobby
					lobby.phase = 'lobby';
					lobby.phaseExpiration = null;
					lobby.players = lobby.players.map((player) => ({
						...player,
						score: 0,
					}));
				} else {
					// Start new round
					lobby.currentRound++;
					lobby.phase = 'definition';
					lobby.phaseExpiration = Date.now() + 120 * 1000; // 2 minutes for definition

					// Get new word for the round
					const { word, definition } = await this.getNewWord(lobbyId);
					lobby.currentWord = word;
					lobby.correctDefinition = definition;
					lobby.definitions = [
						{
							id: uuid(),
							playerId: 'system',
							text: definition,
							votes: [],
							isCorrect: true,
						},
					];
					lobby.votes = [];
				}
				break;
		}

		await this.updateLobby(lobby);
	}

	public async submitDefinition(
		playerId: string,
		definition: string,
		lobbyId: string,
	): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) throw new Error('Lobby not found');
		if (lobby.phase !== 'definition')
			throw new Error('Not in definition phase');
		if (lobby.definitions.some((d) => d.playerId === playerId)) {
			throw new Error('Already submitted a definition');
		}

		const newDefinition: Definition = {
			id: uuid(),
			playerId,
			text: definition,
			votes: [],
			isCorrect: false,
		};
		lobby.definitions.push(newDefinition);
		await this.updateLobby(lobby);
	}

	public async voteDefinition(
		playerId: string,
		definitionId: string,
		lobbyId: string,
	): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) throw new Error('Lobby not found');
		if (lobby.phase !== 'voting') throw new Error('Not in voting phase');
		if (lobby.votes.some((v) => v.playerId === playerId)) {
			throw new Error('Already voted');
		}

		lobby.votes.push({ playerId, definitionId });

		const definition = lobby.definitions.find((d) => d.id === definitionId);
		if (definition) {
			definition.votes.push(playerId);
		}

		await this.updateLobby(lobby);
	}

	public async getGameState(
		playerId: string,
		lobbyId: string,
	): Promise<GameState> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) throw new Error('Lobby not found');
		return this.buildGameState(playerId, lobby);
	}

	public async reconnect(
		playerId: string,
		lobbyId: string,
	): Promise<GameState> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) throw new Error('Lobby not found');

		const player = lobby.players.find((p) => p.id === playerId);
		if (player) {
			player.connected = true;
			await this.updateLobby(lobby);
		}

		return this.buildGameState(playerId, lobby);
	}

	public async disconnect(playerId: string, lobbyId: string): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) return;

		const player = lobby.players.find((p) => p.id === playerId);
		if (player) {
			player.connected = false;
			await this.updateLobby(lobby);
		}
	}

	public async getNewWord(
		lobbyId: string,
	): Promise<{ word: string; definition: string }> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) throw new Error('Lobby not found');

		return this.wordSource.getWord(lobby.language, lobby.usedWords);
	}

	public async updateScores(players: Player[], lobbyId: string): Promise<void> {
		const lobby = await this.getLobby(lobbyId);
		if (!lobby) return;

		lobby.players = players.map((p) => ({
			id: p.id,
			nickname: p.nickname,
			connected: p.connected,
			score: p.score,
		}));

		await this.updateLobby(lobby);
	}

	public async getLobbies(): Promise<Lobby[]> {
		return await this.getStoredLobbies();
	}
}

// Singleton instance
let instance: LocalStorageGameApiImpl | null = null;
export function getLocalStorageGameApi(): GameApi {
	if (!instance) instance = new LocalStorageGameApiImpl();
	return instance;
}

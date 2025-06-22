import Peer, { type DataConnection } from 'peerjs';
import { v4 as uuid } from 'uuid';
import type { Definition, GameState, Lobby, Player } from '../models/Game';
import type { GameApi } from './GameApi';
import { SimpleWordSource } from './SimpleWordSource';
import type { Language } from './WordSource';

interface PeerMessage {
	type: 'gameState' | 'action' | 'heartbeat';
	data: any;
	timestamp: number;
}

interface PeerInfo {
	id: string;
	nickname: string;
	connection: DataConnection;
	connected: boolean;
}

class PeerJSGameApiImpl implements GameApi {
	private wordSource = new SimpleWordSource();
	private peer: Peer | null = null;
	private isHost = false;
	private hostConnection: DataConnection | null = null;
	private peers = new Map<string, PeerInfo>();
	private lobby: Lobby | null = null;
	private playerId: string | null = null;
	private gameStateCallbacks = new Set<() => void>();
	private connectionCallbacks = new Set<(connected: boolean) => void>();

	private notifyStateChange() {
		this.gameStateCallbacks.forEach((callback) => callback());
	}

	private notifyConnectionChange(connected: boolean) {
		this.connectionCallbacks.forEach((callback) => callback(connected));
	}

	// Subscribe to game state changes
	public subscribeToStateChanges(callback: () => void): () => void {
		this.gameStateCallbacks.add(callback);
		return () => this.gameStateCallbacks.delete(callback);
	}

	// Subscribe to connection changes
	public subscribeToConnectionChanges(
		callback: (connected: boolean) => void,
	): () => void {
		this.connectionCallbacks.add(callback);
		return () => this.connectionCallbacks.delete(callback);
	}

	// Get the peer ID for sharing
	public getPeerId(): string | null {
		return this.peer?.id || null;
	}

	// Check if peer is ready
	public isPeerReady(): boolean {
		return this.peer !== null && !this.peer.destroyed;
	}

	private async sendMessage(message: PeerMessage, targetPeerId?: string) {
		if (this.isHost) {
			// Host sends to all peers or specific peer
			if (targetPeerId) {
				const peer = this.peers.get(targetPeerId);
				if (peer?.connection.open) {
					peer.connection.send(message);
				}
			} else {
				// Broadcast to all peers
				for (const peer of this.peers.values()) {
					if (peer.connection.open) {
						peer.connection.send(message);
					}
				}
			}
		} else {
			// Peer sends to host
			if (this.hostConnection?.open) {
				this.hostConnection.send(message);
			}
		}
	}

	private handleMessage(message: PeerMessage, fromPeerId?: string) {
		console.log('Received message:', message.type, 'from:', fromPeerId);

		switch (message.type) {
			case 'gameState':
				if (!this.isHost) {
					// Only peers should receive game state updates
					console.log('Updating game state with:', message.data);
					const receivedState = message.data;

					// Extract timeLeft and convert back to phaseExpiration if needed
					if (
						receivedState.timeLeft !== undefined &&
						receivedState.timeLeft > 0
					) {
						// Convert timeLeft back to phaseExpiration for internal consistency
						receivedState.phaseExpiration =
							Date.now() + receivedState.timeLeft * 1000;
					}

					this.lobby = receivedState;
					this.notifyStateChange();
				}
				break;
			case 'action':
				if (this.isHost) {
					// Host processes actions from peers
					this.handlePeerAction(message.data, fromPeerId);
				}
				break;
			case 'heartbeat':
				// Respond to heartbeat
				if (this.isHost && fromPeerId) {
					this.sendMessage(
						{ type: 'heartbeat', data: 'pong', timestamp: Date.now() },
						fromPeerId,
					);
				}
				break;
		}
	}

	private async handlePeerAction(action: any, fromPeerId?: string) {
		if (!this.isHost || !this.lobby) return;

		console.log('Handling peer action:', action.type, 'from:', fromPeerId);

		try {
			switch (action.type) {
				case 'join':
					await this.handleJoinRequest(action.playerId, action.nickname);
					break;
				case 'submitDefinition':
					await this.handleSubmitDefinition(action.playerId, action.definition);
					break;
				case 'voteDefinition':
					await this.handleVoteDefinition(action.playerId, action.definitionId);
					break;
				case 'leaveLobby':
					await this.handleLeaveLobby(action.playerId);
					break;
				default:
					console.warn('Unknown action type:', action.type);
			}

			// Note: Individual handlers now broadcast their own state updates
		} catch (error) {
			console.error('Error handling peer action:', error);
		}
	}

	private async handleJoinRequest(playerId: string, nickname: string) {
		if (!this.lobby) return;

		// Check if player already exists
		const existingPlayer = this.lobby.players.find((p) => p.id === playerId);
		if (existingPlayer) {
			existingPlayer.connected = true;
			// Still broadcast state in case of reconnection
			await this.broadcastGameState();
			// Notify host's own UI of state change
			this.notifyStateChange();
			return;
		}

		// Add new player to lobby
		this.lobby.players.push({
			id: playerId,
			nickname,
			score: 0,
			connected: true,
		});

		console.log(`Player ${nickname} joined the lobby`);

		// Broadcast updated game state to all peers
		await this.broadcastGameState();

		// Notify host's own UI of state change
		this.notifyStateChange();
	}

	private async broadcastGameState() {
		if (!this.isHost || !this.lobby) return;

		console.log('Broadcasting game state to', this.peers.size, 'peers');
		console.log('Current lobby state:', this.lobby);

		// Calculate timeLeft for broadcast
		const timeLeft = this.lobby.phaseExpiration
			? Math.max(
					0,
					Math.floor((this.lobby.phaseExpiration - Date.now()) / 1000),
				)
			: 0;

		// Create a complete game state object for broadcasting
		const gameStateForBroadcast = {
			...this.lobby,
			timeLeft, // Include calculated timeLeft
		};

		const message: PeerMessage = {
			type: 'gameState',
			data: gameStateForBroadcast,
			timestamp: Date.now(),
		};

		await this.sendMessage(message);
	}

	// Initialize peer connection
	private async initializePeer(peerId?: string): Promise<void> {
		return new Promise((resolve, reject) => {
			// Use default PeerJS server with STUN servers for better connectivity
			const config = {
				debug: 2, // Enable debug logging
				config: {
					iceServers: [
						{ urls: 'stun:stun.l.google.com:19302' },
						{ urls: 'stun:stun1.l.google.com:19302' },
					],
				},
			};

			this.peer = peerId ? new Peer(peerId, config) : new Peer(config);

			this.peer.on('open', (id) => {
				console.log('Peer connected with ID:', id);
				// Add small delay to ensure peer is fully ready
				setTimeout(() => resolve(), 1000);
			});

			this.peer.on('error', (error) => {
				console.error('Peer error:', error);
				// Handle different error types
				if (error.type === 'peer-unavailable') {
					reject(
						new Error(
							'The host is not available. They may have left the game or their connection is poor.',
						),
					);
				} else if (error.type === 'network') {
					reject(
						new Error(
							'Network connection failed. Please check your internet connection.',
						),
					);
				} else if (error.type === 'server-error') {
					reject(
						new Error('Connection server error. Please try again in a moment.'),
					);
				} else {
					reject(error);
				}
			});

			this.peer.on('connection', (conn) => {
				console.log('Incoming connection from:', conn.peer);
				this.setupPeerConnection(conn);
			});

			this.peer.on('disconnected', () => {
				console.log('Peer disconnected from server');
				// Try to reconnect
				if (!this.peer!.destroyed) {
					this.peer!.reconnect();
				}
			});
		});
	}

	private setupPeerConnection(conn: DataConnection) {
		conn.on('open', () => {
			console.log('Connection opened with:', conn.peer);

			if (this.isHost) {
				// Store peer connection
				this.peers.set(conn.peer, {
					id: conn.peer,
					nickname: 'Unknown',
					connection: conn,
					connected: true,
				});
			} else {
				// This is a peer connecting to host
				this.hostConnection = conn;
				this.notifyConnectionChange(true);
				// Join request will be sent separately with proper nickname
			}
		});

		conn.on('data', (data) => {
			try {
				const message = data as PeerMessage;
				this.handleMessage(message, conn.peer);
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		});

		conn.on('close', () => {
			console.log('Connection closed:', conn.peer);
			if (this.isHost) {
				this.peers.delete(conn.peer);
			} else {
				this.notifyConnectionChange(false);
			}
		});

		conn.on('error', (error) => {
			console.error('Connection error:', error);
		});
	}

	// Connect to host using peer ID
	public async connectToHost(
		hostPeerId: string,
		nickname: string,
	): Promise<{ playerId: string }> {
		if (this.isHost) throw new Error('Host cannot connect to another host');

		this.playerId = uuid();

		if (!this.peer) {
			await this.initializePeer(); // Don't pass hostPeerId - generate new peer ID
		}

		// Add small delay to ensure both peers are ready
		await new Promise((resolve) => setTimeout(resolve, 500));

		return new Promise((resolve, reject) => {
			if (!this.peer) {
				reject(new Error('Peer not initialized'));
				return;
			}

			console.log(`Attempting to connect to host: ${hostPeerId}`);
			const conn = this.peer.connect(hostPeerId, {
				reliable: true,
				serialization: 'json',
			});

			// Set up timeout for connection attempt
			const timeoutId = setTimeout(() => {
				conn.close();
				reject(
					new Error(
						'Connection timeout. The host may be offline or unreachable.',
					),
				);
			}, 10000); // 10 second timeout

			this.setupPeerConnection(conn);

			// Store nickname for join request
			conn.on('open', () => {
				console.log(`Successfully connected to host: ${hostPeerId}`);
				clearTimeout(timeoutId);

				// Update the join request with the actual nickname
				this.sendMessage({
					type: 'action',
					data: {
						type: 'join',
						playerId: this.playerId,
						nickname,
					},
					timestamp: Date.now(),
				});

				resolve({ playerId: this.playerId! });
			});

			conn.on('error', (error) => {
				console.error('Connection error:', error);
				clearTimeout(timeoutId);

				// Provide user-friendly error messages
				// DataConnection errors have different types than Peer errors
				const errorMessage = error.message || error.toString();
				if (errorMessage.includes('Could not connect to peer')) {
					reject(
						new Error(
							'Game not found. Please check the game code and try again.',
						),
					);
				} else if (
					errorMessage.includes('network') ||
					errorMessage.includes('Network')
				) {
					reject(
						new Error(
							'Network error. Please check your connection and try again.',
						),
					);
				} else {
					reject(new Error(`Failed to connect: ${errorMessage}`));
				}
			});

			conn.on('close', () => {
				console.log('Connection closed during setup');
				clearTimeout(timeoutId);
			});
		});
	}

	// GameApi implementation
	public async createLobby(
		nickname: string,
		rounds: number,
		language: Language,
	): Promise<{ playerId: string; lobbyId: string }> {
		this.isHost = true;
		this.playerId = uuid();
		const lobbyId = this.generateLobbyId();

		// Initialize peer as host
		await this.initializePeer(lobbyId);

		this.lobby = {
			id: lobbyId,
			name: `${nickname}'s Game`,
			players: [
				{
					id: this.playerId,
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

		this.notifyConnectionChange(true);
		this.notifyStateChange(); // Notify host's UI of initial lobby state
		return { playerId: this.playerId, lobbyId };
	}

	public async joinLobby(
		lobbyId: string,
		nickname: string,
	): Promise<{ playerId: string }> {
		return this.connectToHost(lobbyId, nickname);
	}

	public async leaveLobby(playerId: string): Promise<void> {
		if (this.isHost) {
			await this.handleLeaveLobby(playerId);
		} else {
			await this.sendMessage({
				type: 'action',
				data: { type: 'leaveLobby', playerId },
				timestamp: Date.now(),
			});
		}
	}

	private async handleLeaveLobby(playerId: string): Promise<void> {
		if (!this.lobby) return;

		// Remove player from lobby
		this.lobby.players = this.lobby.players.filter((p) => p.id !== playerId);

		// Remove peer connection
		this.peers.delete(playerId);

		await this.broadcastGameState();
		this.notifyStateChange(); // Notify host's UI of player leave
	}

	public async startGame(): Promise<void> {
		if (!this.isHost || !this.lobby)
			throw new Error('Only host can start game');

		if (this.lobby.phase !== 'lobby') throw new Error('Game already started');
		if (this.lobby.players.length < 2)
			throw new Error('Need at least 2 players');

		const { word, definition } = await this.wordSource.getWord(
			this.lobby.language,
			[],
		);

		this.lobby.players = this.lobby.players.map((player) => ({
			...player,
			score: 0,
		}));

		this.lobby.phase = 'definition';
		this.lobby.currentRound = 1;
		this.lobby.currentWord = word;
		this.lobby.correctDefinition = definition;
		this.lobby.definitions = [
			{
				id: uuid(),
				playerId: 'system',
				text: definition,
				votes: [],
				isCorrect: true,
			},
		];
		this.lobby.votes = [];
		this.lobby.usedWords = [word];
		this.lobby.phaseExpiration = Date.now() + 120 * 1000; // 2 minutes

		await this.broadcastGameState();
		this.notifyStateChange(); // Notify host's UI of game start
	}

	public async advancePhase(): Promise<void> {
		if (!this.isHost || !this.lobby)
			throw new Error('Only host can advance phase');

		switch (this.lobby.phase) {
			case 'definition':
				this.lobby.phase = 'voting';
				this.lobby.phaseExpiration = Date.now() + 120 * 1000;
				break;
			case 'voting':
				this.lobby.phase = 'results';
				this.lobby.phaseExpiration = Date.now() + 15 * 1000;
				break;
			case 'results':
				if (this.lobby.currentRound >= this.lobby.totalRounds) {
					this.lobby.phase = 'lobby';
					this.lobby.phaseExpiration = null;
					this.lobby.players = this.lobby.players.map((player) => ({
						...player,
						score: 0,
					}));
				} else {
					this.lobby.currentRound++;
					this.lobby.phase = 'definition';
					this.lobby.phaseExpiration = Date.now() + 120 * 1000;

					const { word, definition } = await this.getNewWord();
					this.lobby.currentWord = word;
					this.lobby.correctDefinition = definition;
					this.lobby.definitions = [
						{
							id: uuid(),
							playerId: 'system',
							text: definition,
							votes: [],
							isCorrect: true,
						},
					];
					this.lobby.votes = [];
				}
				break;
		}

		await this.broadcastGameState();
		this.notifyStateChange(); // Notify host's UI of phase advance
	}

	public async submitDefinition(
		playerId: string,
		definition: string,
	): Promise<void> {
		if (this.isHost) {
			await this.handleSubmitDefinition(playerId, definition);
		} else {
			await this.sendMessage({
				type: 'action',
				data: { type: 'submitDefinition', playerId, definition },
				timestamp: Date.now(),
			});
		}
	}

	private async handleSubmitDefinition(
		playerId: string,
		definition: string,
	): Promise<void> {
		if (!this.lobby) throw new Error('Lobby not found');
		if (this.lobby.phase !== 'definition')
			throw new Error('Not in definition phase');
		if (this.lobby.definitions.some((d) => d.playerId === playerId)) {
			throw new Error('Already submitted a definition');
		}

		const newDefinition: Definition = {
			id: uuid(),
			playerId,
			text: definition,
			votes: [],
			isCorrect: false,
		};
		this.lobby.definitions.push(newDefinition);

		console.log(`Player ${playerId} submitted definition: ${definition}`);

		// Check if all players have submitted definitions
		const allPlayersSubmitted =
			this.lobby.players.every((player) =>
				this.lobby!.definitions.some((def) => def.playerId === player.id),
			) && this.lobby.definitions.length === this.lobby.players.length + 1; // +1 for system definition

		if (allPlayersSubmitted) {
			console.log(
				'All players have submitted definitions, advancing to voting phase',
			);
			// Auto-advance to voting phase
			this.lobby.phase = 'voting';
			this.lobby.phaseExpiration = Date.now() + 120 * 1000; // 2 minutes for voting
		}

		// Broadcast updated game state to all peers
		await this.broadcastGameState();
		// Notify host's own UI of state change
		this.notifyStateChange();
	}

	public async voteDefinition(
		playerId: string,
		definitionId: string,
	): Promise<void> {
		if (this.isHost) {
			await this.handleVoteDefinition(playerId, definitionId);
		} else {
			await this.sendMessage({
				type: 'action',
				data: { type: 'voteDefinition', playerId, definitionId },
				timestamp: Date.now(),
			});
		}
	}

	private async handleVoteDefinition(
		playerId: string,
		definitionId: string,
	): Promise<void> {
		if (!this.lobby) throw new Error('Lobby not found');
		if (this.lobby.phase !== 'voting') throw new Error('Not in voting phase');
		if (this.lobby.votes.some((v) => v.playerId === playerId)) {
			throw new Error('Already voted');
		}

		this.lobby.votes.push({ playerId, definitionId });

		const definition = this.lobby.definitions.find(
			(d) => d.id === definitionId,
		);
		if (definition) {
			definition.votes.push(playerId);
		}

		console.log(`Player ${playerId} voted for definition: ${definitionId}`);

		// Check if all players have voted
		const allPlayersVoted = this.lobby.players.every((player) =>
			this.lobby!.votes.some((vote) => vote.playerId === player.id),
		);

		if (allPlayersVoted) {
			console.log(
				'All players have voted, calculating scores and advancing to results phase',
			);

			// Calculate scores
			const roundScores = new Map<string, number>();

			// Initialize round scores for all players
			this.lobby.players.forEach((player) => {
				roundScores.set(player.id, 0);
			});

			// Process votes and calculate round scores
			this.lobby.votes.forEach((vote) => {
				const votedDefinition = this.lobby!.definitions.find(
					(def) => def.id === vote.definitionId,
				);
				if (votedDefinition) {
					if (votedDefinition.isCorrect) {
						// Player who voted for the correct definition gets 1 point
						const currentScore = roundScores.get(vote.playerId) || 0;
						roundScores.set(vote.playerId, currentScore + 1);
					} else {
						// Player who fooled others gets 1 point for each vote they received
						const currentScore = roundScores.get(votedDefinition.playerId) || 0;
						roundScores.set(votedDefinition.playerId, currentScore + 1);
					}
				}
			});

			// Update player scores by adding round scores to existing scores
			this.lobby.players = this.lobby.players.map((player) => {
				const roundScore = roundScores.get(player.id) || 0;
				const newTotalScore = (player.score || 0) + roundScore;
				return {
					...player,
					score: newTotalScore,
				};
			});

			// Auto-advance to results phase
			this.lobby.phase = 'results';
			this.lobby.phaseExpiration = Date.now() + 15 * 1000; // 15 seconds for results
		}

		// Broadcast updated game state to all peers
		await this.broadcastGameState();
		// Notify host's own UI of state change
		this.notifyStateChange();
	}

	public async getGameState(playerId: string): Promise<GameState> {
		if (!this.lobby) throw new Error('Lobby not found');

		const players: Player[] = this.lobby.players.map((p) => ({
			id: p.id,
			nickname: p.nickname,
			score: p.score,
			connected: p.connected,
		}));

		const definitions = this.lobby.definitions.map((d) => ({
			id: d.id,
			playerId: d.playerId,
			text: d.text,
			votes: d.votes,
			isCorrect: d.isCorrect,
		}));

		const timeLeft = this.lobby.phaseExpiration
			? Math.max(
					0,
					Math.floor((this.lobby.phaseExpiration - Date.now()) / 1000),
				)
			: 0;

		return {
			phase: this.lobby.phase,
			players,
			currentWord: this.lobby.currentWord,
			definitions,
			round: this.lobby.round,
			selfId: playerId,
			timeLeft,
			currentRound: this.lobby.currentRound,
			correctDefinition: this.lobby.correctDefinition,
			votes: this.lobby.votes,
			totalRounds: this.lobby.totalRounds,
			lobbyId: this.lobby.id,
			language: this.lobby.language,
		};
	}

	public async reconnect(playerId: string): Promise<GameState> {
		// For PeerJS, reconnection would involve re-establishing the peer connection
		return this.getGameState(playerId);
	}

	public async disconnect(): Promise<void> {
		// Close peer connections
		if (this.isHost) {
			for (const peer of this.peers.values()) {
				peer.connection.close();
			}
			this.peers.clear();
		} else {
			this.hostConnection?.close();
		}

		this.peer?.destroy();
		this.notifyConnectionChange(false);
	}

	public async getNewWord(): Promise<{ word: string; definition: string }> {
		if (!this.lobby) throw new Error('Lobby not found');
		return this.wordSource.getWord(this.lobby.language, this.lobby.usedWords);
	}

	public async updateScores(players: Player[]): Promise<void> {
		if (!this.isHost || !this.lobby) return;

		this.lobby.players = players.map((p) => ({
			id: p.id,
			nickname: p.nickname,
			connected: p.connected,
			score: p.score,
		}));

		await this.broadcastGameState();
		this.notifyStateChange(); // Notify host's UI of score update
	}

	public async getLobbies(): Promise<Lobby[]> {
		// PeerJS doesn't support lobby discovery without additional infrastructure
		return [];
	}

	private generateLobbyId(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 4; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	// Cleanup method
	public cleanup(): void {
		// Close all connections
		for (const peer of this.peers.values()) {
			peer.connection.close();
		}
		this.hostConnection?.close();
		this.peer?.destroy();
		this.peers.clear();
		this.gameStateCallbacks.clear();
		this.connectionCallbacks.clear();
	}
}

// Singleton instance
let instance: PeerJSGameApiImpl | null = null;
export function getPeerJSGameApi(): PeerJSGameApiImpl {
	if (!instance) instance = new PeerJSGameApiImpl();
	return instance;
}

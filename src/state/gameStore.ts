import { create } from 'zustand';
import type { GameApi } from '../api/GameApi';
import type { Language } from '../api/WordSource';
import type { GameState } from '../models/Game';

interface GameStore {
	// State
	gameState: GameState | null;
	loading: boolean;
	reconnecting: boolean;
	error: string | null;
	playerId: string | null;
	lobbyId: string | null;
	api?: GameApi;
	phaseExpiration: number | null;
	isLeaving: boolean;

	// Subscriptions
	subscribe: (callback: () => void) => () => void;

	// API setup
	setApi: (api: GameApi) => void;
	setPlayerId: (id: string) => void;
	setLobbyId: (id: string) => void;

	// URL management
	updateUrl: (lobbyId?: string) => void;
	updateGameUrl: (lobbyId: string) => void;
	getLobbyIdFromUrl: () => string | null;

	// Timer management
	startPhaseTimer: (duration: number) => void;
	clearPhaseTimer: () => void;
	handleTimerExpiration: () => Promise<void>;

	// Lobby operations
	createLobby: (
		nickname: string,
		rounds: number,
		language: Language,
	) => Promise<void>;
	joinLobby: (lobbyId: string, nickname: string) => Promise<void>;
	leaveLobby: () => Promise<void>;

	// Game operations
	startGame: () => Promise<void>;
	submitDefinition: (definition: string) => Promise<void>;
	voteDefinition: (definitionId: string) => Promise<void>;

	// State management
	reconnect: () => Promise<void>;
	disconnect: () => Promise<void>;
	fetchGameState: () => Promise<void>;
	attemptReconnection: () => Promise<void>;

	// Game flow
	advancePhase: () => Promise<void>;
	startNewRound: () => Promise<void>;
	scoreRound: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => {
	const subscribers = new Set<() => void>();

	const notifySubscribers = () => {
		subscribers.forEach((callback) => callback());
	};

	// Listen for game state changes from the API
	if (typeof window !== 'undefined') {
		window.addEventListener('storage', (event) => {
			if (event.key === 'dico-game-lobbies') {
				const { api, playerId, lobbyId } = get();
				if (api && playerId && lobbyId) {
					get().fetchGameState();
				}
			}
		});
	}

	// Helper functions
	const checkAllPlayersSubmitted = (gameState: GameState): boolean => {
		return (
			gameState.players.every((player) =>
				gameState.definitions.some((def) => def.playerId === player.id),
			) && gameState.definitions.length === gameState.players.length + 1
		); // +1 for system definition
	};

	const checkAllPlayersVoted = (gameState: GameState): boolean => {
		return gameState.players.every((player) =>
			gameState.votes.some((vote) => vote.playerId === player.id),
		);
	};

	const shouldAdvancePhase = (gameState: GameState): boolean => {
		switch (gameState.phase) {
			case 'definition':
				return checkAllPlayersSubmitted(gameState);
			case 'voting':
				return checkAllPlayersVoted(gameState);
			case 'results':
				return true; // Always advance from results
			default:
				return false;
		}
	};

	const calculateScores = (gameState: GameState) => {
		const roundScores = new Map<string, number>();

		// Initialize round scores for all players
		gameState.players.forEach((player) => {
			roundScores.set(player.id, 0);
		});

		// Process votes and calculate round scores
		gameState.votes.forEach((vote) => {
			const votedDefinition = gameState.definitions.find(
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
		return gameState.players.map((player) => {
			const roundScore = roundScores.get(player.id) || 0;
			const newTotalScore = (player.score || 0) + roundScore;
			return {
				...player,
				score: newTotalScore,
			};
		});
	};

	return {
		// ===== STATE =====
		gameState: null,
		loading: false,
		reconnecting: false,
		error: null,
		playerId: null,
		lobbyId: null,
		api: undefined as GameApi | undefined,
		phaseExpiration: null,
		isLeaving: false,

		// ===== SUBSCRIPTIONS =====
		subscribe(callback: () => void) {
			subscribers.add(callback);
			return () => {
				subscribers.delete(callback);
			};
		},

		// ===== API SETUP =====
		setApi(api: GameApi) {
			set({ api });

			// Subscribe to real-time state changes from any API implementation
			api.subscribeToStateChanges(() => {
				// Get the updated game state from the API
				const currentState = get();
				if (currentState.playerId && currentState.lobbyId) {
					// Use async function to handle the promise
					const updateGameState = async () => {
						try {
							const gameState = await api.getGameState(
								currentState.playerId!,
								currentState.lobbyId!,
							);
							console.log('Game store received state update:', gameState);

							// Set phase expiration based on timeLeft from API
							const phaseExpiration =
								gameState.timeLeft > 0
									? Date.now() + gameState.timeLeft * 1000
									: null;

							set({
								gameState,
								phaseExpiration,
								loading: false,
								error: null,
							});
							notifySubscribers();
						} catch (error) {
							console.error('Error getting updated game state:', error);
							set({
								error: error instanceof Error ? error.message : 'Unknown error',
							});
						}
					};
					updateGameState();
				}
			});
		},

		setPlayerId(id: string) {
			set({ playerId: id });
		},

		setLobbyId(id: string) {
			set({ lobbyId: id });
		},

		// ===== URL MANAGEMENT =====
		updateUrl(lobbyId?: string) {
			if (lobbyId) {
				window.history.pushState({}, '', `/lobby/${lobbyId}`);
			} else {
				window.history.pushState({}, '', '/');
			}
		},

		updateGameUrl(lobbyId: string) {
			window.history.pushState({}, '', `/game/${lobbyId}`);
		},

		getLobbyIdFromUrl() {
			const path = window.location.pathname;
			const lobbyMatch = path.match(/^\/lobby\/([A-Z0-9]{4})$/);
			const gameMatch = path.match(/^\/game\/([A-Z0-9]{4})$/);
			return lobbyMatch ? lobbyMatch[1] : gameMatch ? gameMatch[1] : null;
		},

		// ===== TIMER MANAGEMENT =====
		startPhaseTimer(duration: number) {
			const expiration = Date.now() + duration * 1000;
			set({ phaseExpiration: expiration });
		},

		clearPhaseTimer() {
			set({ phaseExpiration: null });
		},

		async handleTimerExpiration() {
			const gameState = get().gameState;
			if (!gameState) return;

			// Prevent multiple simultaneous timer expiration calls
			if (get().loading) return;

			const api = get().api;
			const lobbyId = get().lobbyId;

			if (!api || !lobbyId) {
				set({ error: 'API or lobby ID not available' });
				return;
			}

			// Clear the phase expiration immediately to prevent multiple calls
			set({ phaseExpiration: null, loading: true });

			try {
				switch (gameState.phase) {
					case 'definition':
						// For definition phase, players who didn't submit get penalized
						// We don't need to do anything special here since they just won't have a definition
						// The scoring logic will handle this naturally (no points for not submitting)
						await api.advancePhase(lobbyId);
						break;

					case 'voting': {
						// For voting phase, players who didn't vote get penalized
						// We need to calculate scores even if not everyone voted
						const updatedPlayers = calculateScores(gameState);
						await api.updateScores(updatedPlayers, lobbyId);
						await api.advancePhase(lobbyId);
						break;
					}

					case 'results':
						// For results phase, just advance normally
						await api.advancePhase(lobbyId);
						break;

					default:
						// For other phases, just advance normally
						await api.advancePhase(lobbyId);
						break;
				}

				// Fetch updated game state
				await get().fetchGameState();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		// ===== LOBBY OPERATIONS =====
		async createLobby(nickname: string, rounds: number, language: Language) {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				if (!api) {
					set({ error: 'API not available' });
					return;
				}

				const { playerId, lobbyId } = await api.createLobby(
					nickname,
					rounds,
					language,
				);
				set({ playerId, lobbyId });
				get().updateUrl(lobbyId);
				// Store player ID for reconnection in sessionStorage
				sessionStorage.setItem(`dico-player-${lobbyId}`, playerId);
				await get().fetchGameState();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async joinLobby(lobbyId: string, nickname: string) {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				if (!api) {
					set({ error: 'API not available' });
					return;
				}

				const { playerId } = await api.joinLobby(lobbyId, nickname);
				set({ playerId, lobbyId });
				get().updateUrl(lobbyId);
				// Store player ID for reconnection in sessionStorage
				sessionStorage.setItem(`dico-player-${lobbyId}`, playerId);
				await get().fetchGameState();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async leaveLobby() {
			set({ loading: true, error: null, isLeaving: true });
			try {
				const api = get().api;
				const playerId = get().playerId;
				const lobbyId = get().lobbyId;

				if (!api || !playerId || !lobbyId) {
					set({ error: 'API, player ID, or lobby ID not available' });
					return;
				}

				await api.leaveLobby(playerId, lobbyId);
				set({
					playerId: null,
					lobbyId: null,
					gameState: null,
					phaseExpiration: null,
					isLeaving: false,
				});
				get().updateUrl();
				// Clear stored player ID
				sessionStorage.removeItem(`dico-player-${lobbyId}`);
				// Navigate to home page
				window.location.href = '/';
			} catch (e: unknown) {
				set({
					error: e instanceof Error ? e.message : 'Unknown error',
					isLeaving: false,
				});
			} finally {
				set({ loading: false });
			}
		},

		// ===== GAME OPERATIONS =====
		async startGame() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const lobbyId = get().lobbyId;

				if (!api || !lobbyId) {
					set({ error: 'API or lobby ID not available' });
					return;
				}

				await api.startGame(lobbyId);
				get().updateGameUrl(lobbyId);
				await get().fetchGameState();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async submitDefinition(definition: string) {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const playerId = get().playerId;
				const lobbyId = get().lobbyId;

				if (!api || !playerId || !lobbyId) {
					set({ error: 'API, player ID, or lobby ID not available' });
					return;
				}

				await api.submitDefinition(playerId, definition, lobbyId);
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async voteDefinition(definitionId: string) {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const playerId = get().playerId;
				const lobbyId = get().lobbyId;

				if (!api || !playerId || !lobbyId) {
					set({ error: 'API, player ID, or lobby ID not available' });
					return;
				}

				await api.voteDefinition(playerId, definitionId, lobbyId);
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		// ===== STATE MANAGEMENT =====
		async reconnect() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const playerId = get().playerId;
				const lobbyId = get().lobbyId;

				if (!api || !playerId || !lobbyId) {
					set({ error: 'API, player ID, or lobby ID not available' });
					return;
				}

				const gameState = await api.reconnect(playerId, lobbyId);
				set({ gameState });
				notifySubscribers();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async disconnect() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const playerId = get().playerId;
				const lobbyId = get().lobbyId;

				if (!api || !playerId || !lobbyId) {
					set({ error: 'API, player ID, or lobby ID not available' });
					return;
				}

				await api.disconnect(playerId, lobbyId);
				await get().fetchGameState();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async fetchGameState() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const playerId = get().playerId;
				const lobbyId = get().lobbyId;

				// If we don't have a playerId or lobbyId, we can't fetch game state
				if (!api || !playerId || !lobbyId) {
					set({ loading: false });
					return;
				}

				const gameState = await api.getGameState(playerId, lobbyId);

				// Set phase expiration based on timeLeft from API
				const phaseExpiration =
					gameState.timeLeft > 0
						? Date.now() + gameState.timeLeft * 1000
						: null;

				set({ gameState, phaseExpiration });
				notifySubscribers();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		// ===== GAME FLOW =====
		async advancePhase() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const gameState = get().gameState;
				const lobbyId = get().lobbyId;

				if (!api || !gameState || !lobbyId) {
					set({ error: 'API, game state, or lobby ID not available' });
					return;
				}

				const shouldAdvance = shouldAdvancePhase(gameState);
				if (shouldAdvance) {
					await api.advancePhase(lobbyId);
					await get().fetchGameState();
				}
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async startNewRound() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const lobbyId = get().lobbyId;

				if (!api || !lobbyId) {
					set({ error: 'API or lobby ID not available' });
					return;
				}

				await api.advancePhase(lobbyId);
				await get().fetchGameState();
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		async scoreRound() {
			set({ loading: true, error: null });
			try {
				const api = get().api;
				const gameState = get().gameState;
				const lobbyId = get().lobbyId;

				if (!api || !gameState || !lobbyId) {
					set({ error: 'API, game state, or lobby ID not available' });
					return;
				}

				const updatedPlayers = calculateScores(gameState);
				await api.updateScores(updatedPlayers, lobbyId);
			} catch (e: unknown) {
				set({ error: e instanceof Error ? e.message : 'Unknown error' });
			} finally {
				set({ loading: false });
			}
		},

		// ===== STATE MANAGEMENT =====
		async attemptReconnection() {
			const { isLeaving } = get();
			if (isLeaving) {
				return; // Don't attempt reconnection if we're leaving
			}

			set({ loading: true, reconnecting: true, error: null });
			try {
				const api = get().api;
				const lobbyId = get().lobbyId;

				if (!api || !lobbyId) {
					set({ loading: false, reconnecting: false });
					return;
				}

				// Try to get stored player ID for this lobby
				const storedPlayerId = sessionStorage.getItem(`dico-player-${lobbyId}`);

				if (storedPlayerId) {
					try {
						// Try to reconnect with stored player ID
						const gameState = await api.reconnect(storedPlayerId, lobbyId);

						// Set phase expiration based on timeLeft from API
						const phaseExpiration =
							gameState.timeLeft > 0
								? Date.now() + gameState.timeLeft * 1000
								: null;

						set({
							playerId: storedPlayerId,
							gameState,
							phaseExpiration,
							reconnecting: false,
						});
						notifySubscribers();
						return;
					} catch (e) {
						// If reconnection fails, clear the stored player ID
						sessionStorage.removeItem(`dico-player-${lobbyId}`);
						console.log('Reconnection failed, clearing stored player ID:', e);
					}
				}

				// If no stored player ID or reconnection failed, set error
				set({
					error:
						'No active session found for this game. Please join the game first.',
					reconnecting: false,
				});
			} catch (e: unknown) {
				set({
					error: e instanceof Error ? e.message : 'Unknown error',
					reconnecting: false,
				});
			} finally {
				set({ loading: false, reconnecting: false });
			}
		},
	};
});

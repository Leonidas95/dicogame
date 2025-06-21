import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../../state/gameStore';
import { GameCard } from '../ui/game-card';
import { Layout, PageContainer } from '../ui/layout';
import { Loading } from '../ui/loading';
import DefinitionPhase from './DefinitionPhase';
import GameTimer from './GameTimer';
import ResultsPhase from './ResultsPhase';
import VotingPhase from './VotingPhase';

export default function GamePage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { lobbyId: urlLobbyId } = useParams<{ lobbyId: string }>();
	const {
		gameState,
		submitDefinition,
		voteDefinition,
		playerId,
		lobbyId: currentLobbyId,
		loading,
		reconnecting,
		error,
		subscribe,
		setLobbyId,
		fetchGameState,
	} = useGameStore();

	const [votedId, setVotedId] = useState<string | null>(null);
	const prevPhaseRef = useRef<string | undefined>(undefined);
	const prevRoundRef = useRef<number | undefined>(undefined);

	// Set lobby ID from URL if not already set
	useEffect(() => {
		if (urlLobbyId && urlLobbyId !== currentLobbyId) {
			setLobbyId(urlLobbyId);
		}
	}, [urlLobbyId, currentLobbyId, setLobbyId]);

	// Attempt to fetch game state if we have a lobby ID but no game state
	useEffect(() => {
		if (urlLobbyId && !gameState) {
			fetchGameState();
		}
	}, [urlLobbyId, gameState, fetchGameState]);

	// Subscribe to game state updates
	useEffect(() => {
		return subscribe(() => {
			// State updates are already handled by the store
		});
	}, [subscribe]);

	// Reset local state on phase change
	useEffect(() => {
		const currentPhase = gameState?.phase;
		const currentRound = gameState?.round;

		if (
			currentPhase !== prevPhaseRef.current ||
			currentRound !== prevRoundRef.current
		) {
			setVotedId(null);
			prevPhaseRef.current = currentPhase;
			prevRoundRef.current = currentRound;
		}
	}, [gameState?.phase, gameState?.round]);

	// Redirect to lobby if not in game
	useEffect(() => {
		// Only redirect if we're not loading, not reconnecting, and we have a lobby ID but no game state or player ID
		// Also wait a bit to give GameProvider time to set up
		if (!loading && !reconnecting && urlLobbyId && (!gameState || !playerId)) {
			// Add a delay to allow GameProvider to set up
			const timer = setTimeout(() => {
				navigate('/');
			}, 1500); // Wait 1.5 seconds for GameProvider to set up

			return () => clearTimeout(timer);
		}
	}, [gameState, playerId, loading, reconnecting, urlLobbyId, navigate]);

	// Handle phase transitions
	useEffect(() => {
		if (gameState?.phase === 'lobby') {
			navigate(`/lobby/${gameState.lobbyId}`);
		}
	}, [gameState?.phase, gameState?.lobbyId, navigate]);

	// Helper: get my submitted definition
	const myDefinition = (gameState?.definitions || []).find(
		(d) => d.playerId === playerId,
	);

	// Vote for a definition
	const handleVote = async (defId: string) => {
		await voteDefinition(defId);
		setVotedId(defId);
	};

	if (!gameState) {
		if (reconnecting) {
			return (
				<Layout>
					<PageContainer>
						<GameCard className="w-full max-w-md text-center">
							<Loading
								text={t('reconnectingToGame')}
								size="lg"
								className="mb-4"
							/>
							<p className="text-gray-600 dark:text-gray-400">
								{t('pleaseWaitWhileWeReconnectYouToYourGame')}
							</p>
						</GameCard>
					</PageContainer>
				</Layout>
			);
		}
		return null;
	}

	// Early return if we don't have required data for the current phase
	if (!playerId) {
		return null;
	}

	// Early return if we don't have a current word when we need it
	if (gameState.phase !== 'lobby' && !gameState.currentWord) {
		return null;
	}

	return (
		<Layout>
			<PageContainer>
				<div className="w-full max-w-2xl space-y-6">
					<GameTimer />

					{gameState.phase === 'definition' && gameState.currentWord && (
						<DefinitionPhase
							currentWord={gameState.currentWord}
							myDefinition={myDefinition}
							onSubmit={submitDefinition}
							loading={loading}
							players={gameState.players}
							playerId={playerId}
						/>
					)}

					{gameState.phase === 'voting' && gameState.currentWord && (
						<VotingPhase
							currentWord={gameState.currentWord}
							definitions={gameState.definitions}
							playerId={playerId}
							onVote={handleVote}
							loading={loading}
							votedId={votedId}
							players={gameState.players}
						/>
					)}

					{gameState.phase === 'results' && gameState.currentWord && (
						<ResultsPhase
							currentWord={gameState.currentWord}
							definitions={gameState.definitions}
							players={gameState.players}
							currentRound={gameState.currentRound}
							totalRounds={gameState.totalRounds}
							playerId={playerId}
						/>
					)}

					{error && (
						<GameCard variant="warning" className="w-full">
							<div className="text-center">
								<p className="text-red-700 dark:text-red-400 text-sm font-medium">
									{error}
								</p>
							</div>
						</GameCard>
					)}
				</div>
			</PageContainer>
		</Layout>
	);
}

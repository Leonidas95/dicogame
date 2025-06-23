import { Check, Copy, LogOut, Play, Users, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../../state/gameStore';
import { Button } from '../ui/button';
import { GameCard } from '../ui/game-card';
import { Header } from '../ui/header';
import { languages } from '../ui/language-selector';
import { Layout, PageContainer } from '../ui/layout';
import { Loading } from '../ui/loading';

export default function LobbyPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { lobbyId: urlLobbyId } = useParams<{ lobbyId: string }>();
	const [showShareInfo, setShowShareInfo] = useState(false);
	const {
		gameState,
		leaveLobby,
		startGame,
		loading,
		error,
		playerId,
		lobbyId: currentLobbyId,
		subscribe,
		setLobbyId,
		attemptReconnection,
		isLeaving,
	} = useGameStore();

	// Set lobby ID from URL if not already set
	useEffect(() => {
		if (urlLobbyId && urlLobbyId !== currentLobbyId) {
			setLobbyId(urlLobbyId);
		}
	}, [urlLobbyId, currentLobbyId, setLobbyId]);

	// Check if user has a stored player ID for this lobby
	useEffect(() => {
		if (urlLobbyId && !playerId && !isLeaving) {
			const storedPlayerId = sessionStorage.getItem(
				`dico-player-${urlLobbyId}`,
			);
			if (!storedPlayerId) {
				// No stored player ID, redirect to join page
				navigate(`/join/${urlLobbyId}`);
				return;
			}
			// Has stored player ID, attempt reconnection
			attemptReconnection();
		}
	}, [urlLobbyId, playerId, isLeaving, navigate, attemptReconnection]);

	// Subscribe to game state updates
	useEffect(() => {
		return subscribe(() => {
			// State updates are already handled by the store
		});
	}, [subscribe]);

	// Navigate to game when phase changes
	useEffect(() => {
		if (gameState?.phase === 'definition') {
			navigate(`/game/${gameState.lobbyId}`);
		}
	}, [gameState?.phase, gameState?.lobbyId, navigate]);

	const handleLeave = async () => {
		await leaveLobby();
		// Navigation is now handled by the store
	};

	const handleStart = async () => {
		await startGame();
	};

	const copyLobbyLink = () => {
		const url = `${window.location.origin}${import.meta.env.BASE_URL}#/join/${currentLobbyId}`;
		navigator.clipboard.writeText(url);
		setShowShareInfo(true);
		setTimeout(() => setShowShareInfo(false), 2000);
	};

	const canStartGame = gameState?.players && gameState.players.length >= 2;

	// Show loading state while reconnecting
	if (!gameState && !isLeaving) {
		return (
			<Layout>
				<PageContainer>
					<GameCard className="w-full max-w-md text-center">
						<Loading text={t('connectingToLobby')} size="lg" className="mb-4" />
						<p className="text-gray-600 dark:text-gray-400">
							{t('connectingMessage')}
						</p>
					</GameCard>
				</PageContainer>
			</Layout>
		);
	}

	// If we're leaving, show a simple loading state
	if (isLeaving) {
		return (
			<Layout>
				<PageContainer>
					<GameCard className="w-full max-w-md text-center">
						<Loading text={t('leavingLobby')} size="lg" className="mb-4" />
						<p className="text-gray-600 dark:text-gray-400">
							{t('leavingMessage')}
						</p>
					</GameCard>
				</PageContainer>
			</Layout>
		);
	}

	return (
		<Layout>
			<PageContainer>
				<Header
					title={t('lobbyTitle')}
					subtitle={t('lobbySubtitle')}
					showLogo={false}
				/>

				<div className="w-full max-w-2xl space-y-6">
					{/* Game Code Card */}
					<GameCard variant="highlight" className="w-full">
						<div className="text-center">
							<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
								{t('gameCode')}
							</h3>
							<div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg mb-4">
								<p className="text-3xl font-mono font-bold text-green-800 dark:text-green-200 tracking-widest">
									{currentLobbyId}
								</p>
							</div>
							<Button
								onClick={copyLobbyLink}
								variant="outline"
								className="w-full h-12 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
							>
								{showShareInfo ? (
									<>
										<Check className="mr-2 h-5 w-5" />
										{t('linkCopied')}
									</>
								) : (
									<>
										<Copy className="mr-2 h-5 w-5" />
										{t('copyLink')}
									</>
								)}
							</Button>
						</div>
					</GameCard>

					{/* Game Info Card */}
					<GameCard className="w-full">
						<div className="text-center">
							<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
								{t('gameSettings')}
							</h3>
							<div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
								<p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
									{t('roundCount', {
										current: gameState?.currentRound,
										total: gameState?.totalRounds,
									})}
								</p>
								<p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
									{t('totalRoundsToBePlayed')}
								</p>
							</div>
							<div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
								<p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
									{t('language')} :{' '}
									{t(
										languages.find((l) => l.value === gameState?.language)
											?.translationKey ?? 'languageEnglish',
									)}
								</p>
								<p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
									{t('languageDescription')}
								</p>
							</div>
						</div>
					</GameCard>

					{/* Players Card */}
					<GameCard className="w-full">
						<div className="flex items-center mb-4">
							<Users className="mr-2 h-5 w-5 text-gray-600" />
							<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
								{t('playersInLobby')} ({gameState?.players.length || 0})
							</h3>
						</div>

						<div className="space-y-3">
							{gameState?.players.map((player, index) => (
								<div
									key={player.id}
									className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
										player.id === playerId
											? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
											: 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50'
									}`}
								>
									<div className="flex items-center space-x-3">
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
												player.id === playerId
													? 'bg-blue-600 text-white'
													: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
											}`}
										>
											{index + 1}
										</div>
										<div>
											<p
												className={`font-medium ${
													player.id === playerId
														? 'text-blue-800 dark:text-blue-200'
														: 'text-gray-800 dark:text-gray-200'
												}`}
											>
												{player.nickname}
												{player.id === playerId && (
													<span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
														{t('you')}
													</span>
												)}
											</p>
											<div className="flex items-center space-x-1">
												{player.connected ? (
													<>
														<Wifi className="h-3 w-3 text-green-500" />
														<span className="text-xs text-green-600 dark:text-green-400">
															{t('online')}
														</span>
													</>
												) : (
													<>
														<WifiOff className="h-3 w-3 text-red-500" />
														<span className="text-xs text-red-600 dark:text-red-400">
															{t('disconnected')}
														</span>
													</>
												)}
											</div>
										</div>
									</div>

									<div className="text-right">
										<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
											{t('points')}: {player.score}
										</p>
									</div>
								</div>
							))}
						</div>
					</GameCard>

					{/* Action Buttons */}
					<div className="space-y-3">
						{canStartGame && (
							<Button
								onClick={handleStart}
								disabled={loading}
								className="w-full h-14 text-lg font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
							>
								<Play className="mr-2 h-5 w-5" />
								{loading ? t('startingGame') : t('startGame')}
							</Button>
						)}

						<Button
							onClick={handleLeave}
							disabled={loading}
							variant="outline"
							className="w-full h-12 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 transition-all duration-200 disabled:opacity-50"
						>
							<LogOut className="mr-2 h-4 w-4" />
							{t('leaveGame')}
						</Button>
					</div>

					{error && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-700 text-sm font-medium">{error}</p>
						</div>
					)}
				</div>
			</PageContainer>
		</Layout>
	);
}

import { Award, CheckCircle, Trophy, Users, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Definition, Player } from '../../models/Game';
import { Confetti } from '../ui/confetti';
import { GameCard } from '../ui/game-card';
import Scoreboard from './Scoreboard';

interface ResultsPhaseProps {
	currentWord: string;
	definitions: Definition[];
	players: Player[];
	currentRound: number;
	totalRounds: number;
	playerId: string;
}

export default function ResultsPhase({
	currentWord,
	definitions,
	players,
	currentRound,
	totalRounds,
	playerId,
}: ResultsPhaseProps) {
	const { t } = useTranslation();
	const isGameComplete = currentRound >= totalRounds;
	const [showConfetti, setShowConfetti] = useState(false);

	// Find which definition the current player voted for
	const playerVote = definitions.find((def) => def.votes.includes(playerId));

	// Determine if current player is a winner
	const isWinner = useMemo(() => {
		// Check if player voted for correct definition
		const votedCorrect = playerVote?.isCorrect;

		// Check if player's definition received votes (and they didn't vote for themselves)
		const playerDefinition = definitions.find(
			(def) => def.playerId === playerId,
		);
		const receivedVotes =
			playerDefinition &&
			playerDefinition.votes.length > 0 &&
			!playerDefinition.votes.includes(playerId);

		// Check if player is the overall winner at game end
		const isOverallWinner =
			isGameComplete &&
			players.length > 0 &&
			players.sort((a, b) => b.score - a.score)[0].id === playerId;

		return votedCorrect || receivedVotes || isOverallWinner;
	}, [isGameComplete, playerId, definitions, players, playerVote]);

	// Trigger confetti for winners
	useEffect(() => {
		if (isWinner) {
			setShowConfetti(true);
			// Auto-hide confetti after 5 seconds
			setTimeout(() => {
				setShowConfetti(false);
			}, 5000);
		}
	}, [isWinner]);

	return (
		<div className="w-full space-y-6">
			{isGameComplete ? (
				<GameCard variant="success" className="w-full">
					<div className="text-center">
						<div className="flex items-center justify-center mb-4">
							<Trophy className="h-8 w-8 text-yellow-600 mr-2" />
							<h3 className="text-xl font-bold text-green-800 dark:text-green-200">
								{t('gameComplete')}
							</h3>
						</div>

						{/* Overall winner celebration */}
						{players.length > 0 &&
							(() => {
								const sortedPlayers = [...players].sort(
									(a, b) => b.score - a.score,
								);
								const overallWinner = sortedPlayers[0];
								const isOverallWinner = overallWinner.id === playerId;
								const isTie =
									sortedPlayers.length > 1 &&
									sortedPlayers[0].score === sortedPlayers[1].score;

								return (
									<div className="mb-4">
										{isOverallWinner && !isTie ? (
											<div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-lg mb-4">
												<h4 className="text-lg font-bold text-white mb-2">
													🏆 {t('overallWinner')} 🏆
												</h4>
												<p className="text-white text-sm">
													{t('finalScore')} {overallWinner.score} {t('points')}
												</p>
											</div>
										) : isTie ? (
											<div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4 rounded-lg mb-4">
												<h4 className="text-lg font-bold text-white mb-2">
													🤝 {t('tie')} 🤝
												</h4>
												<p className="text-white text-sm">
													{t('multiplePlayersFinished')} {overallWinner.score}{' '}
													{t('points')}
												</p>
											</div>
										) : (
											<div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-4 rounded-lg mb-4">
												<h4 className="text-lg font-bold text-white mb-2">
													🎯 {t('greatGame')} 🎯
												</h4>
												<p className="text-white text-sm">
													{t('winner')} {overallWinner.nickname} {t('with')}{' '}
													{overallWinner.score} {t('points')}
												</p>
											</div>
										)}
									</div>
								);
							})()}

						<p className="text-gray-600 dark:text-gray-400">
							{t('congratulations')} {t('gameFinished')} {t('youReturnToLobby')}
						</p>
					</div>
				</GameCard>
			) : (
				<GameCard variant="highlight" className="w-full">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
							{isGameComplete ? t('gameComplete') : t('roundResults')}
						</h2>
						<div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-lg mb-4">
							<p className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
								{currentWord}
							</p>
						</div>
						<p className="text-gray-600 dark:text-gray-400">
							{t('roundCount', { current: currentRound, total: totalRounds })}
						</p>
					</div>
				</GameCard>
			)}

			{/* Scoreboard */}
			<Scoreboard players={players} playerId={playerId} />

			{/* Definition Results */}
			<GameCard className="w-full">
				<div className="flex items-center mb-4">
					<Award className="mr-2 h-5 w-5 text-purple-600" />
					<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
						{t('definitionResults')}
					</h3>
				</div>

				<div className="space-y-4">
					{definitions.map((def, index) => {
						const author =
							def.playerId === 'system'
								? t('system')
								: players.find((p) => p.id === def.playerId)?.nickname ||
									t('unknown');
						const isCorrect = def.isCorrect;
						const isPlayerVote = def.id === playerVote?.id;

						return (
							<div
								key={def.id}
								className={`p-4 rounded-lg border-2 transition-all duration-200 ${
									isCorrect
										? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
										: isPlayerVote
											? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
											: 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50'
								}`}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex-1">
										<div className="flex items-center mb-2">
											<div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 mr-3">
												{index + 1}
											</div>
											<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
												{author}
											</span>
										</div>
										<p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
											"{def.text}"
										</p>
									</div>

									<div className="flex flex-col items-end space-y-1 ml-3">
										{isCorrect && (
											<div className="flex items-center text-green-600 dark:text-green-400">
												<CheckCircle className="h-4 w-4 mr-1" />
												<span className="text-xs font-medium">
													{t('correct')}
												</span>
											</div>
										)}
										{isPlayerVote && !isCorrect && (
											<div className="flex items-center text-red-600 dark:text-red-400">
												<XCircle className="h-4 w-4 mr-1" />
												<span className="text-xs font-medium">
													{t('yourVote')}
												</span>
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
									<div className="flex items-center">
										<Users className="h-3 w-3 mr-1" />
										<span>{t('voteCount', { count: def.votes.length })}</span>
									</div>
									{def.votes.length > 0 && (
										<span className="text-xs">
											{t('votedBy')}{' '}
											{def.votes
												.map((voterId) => {
													const voter = players.find((p) => p.id === voterId);
													return voter ? voter.nickname : t('unknown');
												})
												.join(', ')}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</GameCard>

			<Confetti isActive={showConfetti} />
		</div>
	);
}

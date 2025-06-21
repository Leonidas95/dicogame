import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Player } from '../../models/Game';
import { GameCard } from '../ui/game-card';

interface ScoreboardProps {
	players: Player[];
	playerId: string;
	className?: string;
}

export default function Scoreboard({
	players,
	playerId,
	className = '',
}: ScoreboardProps) {
	const { t } = useTranslation();

	return (
		<GameCard className={`w-full ${className}`}>
			<div className="flex items-center mb-4">
				<Trophy className="mr-2 h-5 w-5 text-yellow-600" />
				<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
					{t('scoreboard')}
				</h3>
			</div>

			<div className="space-y-3">
				{players
					.sort((a, b) => b.score - a.score)
					.map((player, index) => {
						const isCurrentPlayer = player.id === playerId;
						const isTopThree = index < 3;

						return (
							<div
								key={player.id}
								className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
									isCurrentPlayer
										? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
										: 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50'
								}`}
							>
								<div className="flex items-center space-x-3">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
											isTopThree
												? index === 0
													? 'bg-yellow-500 text-white'
													: index === 1
														? 'bg-gray-400 text-white'
														: 'bg-orange-500 text-white'
												: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
										}`}
									>
										{isTopThree
											? index === 0
												? '🥇'
												: index === 1
													? '🥈'
													: '🥉'
											: index + 1}
									</div>
									<div>
										<p
											className={`font-medium ${
												isCurrentPlayer
													? 'text-blue-800 dark:text-blue-200'
													: 'text-gray-800 dark:text-gray-200'
											}`}
										>
											{player.nickname}
											{isCurrentPlayer && (
												<span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
													{t('you')}
												</span>
											)}
										</p>
									</div>
								</div>

								<div className="text-right">
									<p className="text-lg font-bold text-gray-800 dark:text-gray-200">
										{player.score}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{t('points')}
									</p>
								</div>
							</div>
						);
					})}
			</div>
		</GameCard>
	);
}

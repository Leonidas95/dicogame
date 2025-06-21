import { CheckCircle, Vote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Definition, Player } from '../../models/Game';
import { Button } from '../ui/button';
import { GameCard } from '../ui/game-card';
import ScoreboardToggle from './ScoreboardToggle';

interface VotingPhaseProps {
	currentWord: string;
	definitions: Definition[];
	playerId: string;
	onVote: (definitionId: string) => Promise<void>;
	loading: boolean;
	votedId: string | null;
	players: Player[];
}

export default function VotingPhase({
	currentWord,
	definitions,
	playerId,
	onVote,
	loading,
	votedId,
	players,
}: VotingPhaseProps) {
	const { t } = useTranslation();

	const votingDefinitions = definitions
		.filter((def) => def.playerId !== playerId)
		.sort(() => Math.random() - 0.5);

	return (
		<div className="w-full space-y-6">
			{/* Word Display */}
			<GameCard variant="highlight" className="w-full">
				<div className="text-center">
					<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
						{t('voteForBestDefinition')}
					</h2>
					<div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-lg">
						<p className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
							{currentWord}
						</p>
					</div>
				</div>
			</GameCard>

			{/* Scoreboard Toggle */}
			<ScoreboardToggle players={players} playerId={playerId} />

			{/* Instructions */}
			<GameCard className="w-full">
				<div className="text-center">
					<div className="flex items-center justify-center mb-2">
						<Vote className="h-5 w-5 text-green-600 mr-2" />
						<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
							{t('chooseWisely')}
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 text-sm">
						{t('votingInstructions')}
					</p>
				</div>
			</GameCard>

			{/* Definitions */}
			<div className="space-y-4">
				{votingDefinitions.map((def, index) => (
					<GameCard
						key={def.id}
						variant={votedId === def.id ? 'success' : 'default'}
						className="w-full cursor-pointer transition-all duration-200 hover:shadow-lg"
					>
						<div className="space-y-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center mb-2">
										<div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 mr-3">
											{index + 1}
										</div>
										<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
											{t('definitionNumber', { number: index + 1 })}
										</span>
									</div>
									<p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
										"{def.text}"
									</p>
								</div>

								{votedId === def.id && (
									<CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-3" />
								)}
							</div>

							<Button
								onClick={() => onVote(def.id)}
								disabled={loading || votedId !== null}
								variant={votedId === def.id ? 'default' : 'outline'}
								className={`w-full h-12 font-medium transition-all duration-200 ${
									votedId === def.id
										? 'bg-green-600 hover:bg-green-700 text-white'
										: 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
								} disabled:opacity-50`}
							>
								{votedId === def.id ? (
									<>
										<CheckCircle className="mr-2 h-4 w-4" />
										{t('voted')}
									</>
								) : (
									<>
										<Vote className="mr-2 h-4 w-4" />
										{t('voteForThisDefinition')}
									</>
								)}
							</Button>
						</div>
					</GameCard>
				))}
			</div>

			{votedId && (
				<GameCard variant="success" className="w-full">
					<div className="text-center">
						<div className="flex items-center justify-center mb-2">
							<CheckCircle className="h-6 w-6 text-green-600 mr-2" />
							<h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
								{t('voteSubmitted')}
							</h3>
						</div>
						<p className="text-gray-600 dark:text-gray-400 text-sm">
							{t('waitingForVotes')}
						</p>
					</div>
				</GameCard>
			)}
		</div>
	);
}

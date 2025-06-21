import { CheckCircle, Clock, Edit3 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Definition, Player } from '../../models/Game';
import { Button } from '../ui/button';
import { GameCard } from '../ui/game-card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import ScoreboardToggle from './ScoreboardToggle';

interface DefinitionPhaseProps {
	currentWord: string;
	myDefinition: Definition | undefined;
	onSubmit: (definition: string) => Promise<void>;
	loading: boolean;
	players: Player[];
	playerId: string;
}

export default function DefinitionPhase({
	currentWord,
	myDefinition,
	onSubmit,
	loading,
	players,
	playerId,
}: DefinitionPhaseProps) {
	const { t } = useTranslation();
	const [definition, setDefinition] = useState('');
	const [definitionInputId] = useId();

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!definition.trim()) return;
		await onSubmit(definition.trim());
	};

	return (
		<div className="w-full space-y-6">
			{/* Word Display */}
			<GameCard variant="highlight" className="w-full">
				<div className="text-center">
					<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
						{t('currentWord')}
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

			{myDefinition ? (
				<GameCard variant="success" className="w-full">
					<div className="text-center">
						<div className="flex items-center justify-center mb-4">
							<CheckCircle className="h-6 w-6 text-green-600 mr-2" />
							<h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
								{t('definitionSubmitted')}
							</h3>
						</div>

						<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
							<p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
								"{myDefinition.text}"
							</p>
						</div>

						<div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
							<Clock className="h-4 w-4 mr-2" />
							<span className="text-sm">{t('waitingForOtherPlayers')}</span>
						</div>
					</div>
				</GameCard>
			) : (
				<form onSubmit={handleSubmit}>
					<GameCard className="w-full">
						<div className="space-y-4">
							<div className="text-center">
								<div className="flex items-center justify-center mb-2">
									<Edit3 className="h-5 w-5 text-green-600 mr-2" />
									<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
										{t('writeYourDefinition')}
									</h3>
								</div>
								<p className="text-gray-600 dark:text-gray-400 text-sm">
									{t('definitionInstructions')}
								</p>
							</div>

							<div className="space-y-3">
								<Label
									htmlFor={definitionInputId}
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t('yourDefinition')}
								</Label>
								<Textarea
									id={definitionInputId}
									placeholder={t('definitionPlaceholder')}
									value={definition}
									onChange={(e) => setDefinition(e.target.value)}
									disabled={loading}
									className="min-h-[120px] text-base resize-none"
									maxLength={500}
									required
								/>
								<div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
									<span>{t('definitionHint')}</span>
									<span>{definition.length}/500</span>
								</div>
							</div>

							<Button
								type="submit"
								disabled={loading || !definition.trim()}
								className="w-full h-12 text-lg font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
							>
								{loading ? t('submitting') : t('submitDefinition')}
							</Button>
						</div>
					</GameCard>
				</form>
			)}
		</div>
	);
}

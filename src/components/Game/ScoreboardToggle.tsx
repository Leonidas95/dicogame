import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Player } from '../../models/Game';
import { Button } from '../ui/button';
import Scoreboard from './Scoreboard';

interface ScoreboardToggleProps {
	players: Player[];
	playerId: string;
}

export default function ScoreboardToggle({
	players,
	playerId,
}: ScoreboardToggleProps) {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full">
			<Button
				onClick={() => setIsOpen(!isOpen)}
				variant="outline"
				className="w-full h-12 font-medium transition-all duration-200 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 dark:hover:bg-yellow-900/20 dark:hover:border-yellow-600 dark:hover:text-yellow-300"
			>
				<Trophy className="mr-2 h-4 w-4" />
				{isOpen ? t('hideScoreboard') : t('showScoreboard')}
				{isOpen ? (
					<ChevronUp className="ml-2 h-4 w-4" />
				) : (
					<ChevronDown className="ml-2 h-4 w-4" />
				)}
			</Button>

			{isOpen && (
				<div className="mt-4">
					<Scoreboard players={players} playerId={playerId} />
				</div>
			)}
		</div>
	);
}

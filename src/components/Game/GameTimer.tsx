import { AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../state/gameStore';
import { Progress } from '../ui/progress';

export default function GameTimer() {
	const { t } = useTranslation();
	const { gameState, phaseExpiration, handleTimerExpiration } = useGameStore();
	const [timeLeft, setTimeLeft] = useState<number>(0);
	const [totalTime, setTotalTime] = useState<number>(120); // 2 minutes default

	useEffect(() => {
		if (!phaseExpiration) {
			setTimeLeft(0);
			return;
		}

		// Calculate total time for this phase based on the game phase
		let phaseDuration: number;
		switch (gameState?.phase) {
			case 'definition':
				phaseDuration = 120; // 2 minutes
				break;
			case 'voting':
				phaseDuration = 120; // 2 minutes
				break;
			case 'results':
				phaseDuration = 15; // 15 seconds
				break;
			default:
				phaseDuration = 120; // default fallback
		}
		setTotalTime(phaseDuration);

		const updateTimer = () => {
			const remaining = Math.max(
				0,
				Math.floor((phaseExpiration - Date.now()) / 1000),
			);
			setTimeLeft(remaining);

			if (remaining === 0) {
				// When timer reaches 0, handle phase transition
				handleTimerExpiration();
			}
		};

		// Update immediately
		updateTimer();

		// Then update every second
		const interval = setInterval(updateTimer, 1000);

		return () => clearInterval(interval);
	}, [phaseExpiration, handleTimerExpiration, gameState?.phase]);

	if (!gameState || gameState.phase === 'lobby') return null;

	const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
	const isLowTime = timeLeft <= 30;
	const isCriticalTime = timeLeft <= 10;

	const getPhaseText = () => {
		switch (gameState.phase) {
			case 'definition':
				return t('writeDefinition');
			case 'voting':
				return t('voteForDefinition');
			case 'results':
				return t('viewingResults');
			default:
				return '';
		}
	};

	const getPhaseColor = () => {
		if (isCriticalTime) return 'text-red-600';
		if (isLowTime) return 'text-yellow-600';
		return 'text-green-600';
	};

	return (
		<div className="w-full mb-6">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center space-x-2">
						<Clock className={`h-5 w-5 ${getPhaseColor()}`} />
						<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
							{getPhaseText()}
						</span>
					</div>
					{isLowTime && (
						<AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
					)}
				</div>

				<div className="text-center mb-3">
					<div
						className={`text-3xl sm:text-4xl font-bold font-mono ${getPhaseColor()}`}
					>
						{Math.floor(timeLeft / 60)}:
						{(timeLeft % 60).toString().padStart(2, '0')}
					</div>
				</div>

				<Progress
					value={progress}
					className="h-2"
					style={
						{
							'--progress-background': isCriticalTime
								? '#dc2626'
								: isLowTime
									? '#d97706'
									: '#16a34a',
						} as React.CSSProperties
					}
				/>

				<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
					<span>0:00</span>
					<span>
						{Math.floor(totalTime / 60)}:
						{(totalTime % 60).toString().padStart(2, '0')}
					</span>
				</div>
			</div>
		</div>
	);
}

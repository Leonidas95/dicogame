import { ArrowLeft, LogIn } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../../state/gameStore';
import { Button } from '../ui/button';
import { GameCard } from '../ui/game-card';
import { Header } from '../ui/header';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Layout, PageContainer } from '../ui/layout';

export default function JoinPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { lobbyId: urlLobbyId } = useParams<{ lobbyId: string }>();
	const [nickname, setNickname] = useState('');
	const [lobbyExists, setLobbyExists] = useState<boolean | null>(null);
	const {
		joinLobby,
		loading,
		error,
		lobbyId: currentLobbyId,
		api,
	} = useGameStore();
	const [nicknameInputId] = useId();

	// Check if lobby exists when component mounts
	useEffect(() => {
		const checkLobbyExists = async () => {
			if (!urlLobbyId || !api) return;

			try {
				const lobbies = await api.getLobbies();
				const lobby = lobbies.find((l) => l.id === urlLobbyId);
				setLobbyExists(!!lobby);
			} catch (_e) {
				setLobbyExists(false);
			}
		};

		checkLobbyExists();
	}, [urlLobbyId, api]);

	// Navigate to lobby when successfully joined
	useEffect(() => {
		if (currentLobbyId) {
			navigate(`/lobby/${currentLobbyId}`);
		}
	}, [currentLobbyId, navigate]);

	const handleJoinLobby = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!nickname.trim() || !urlLobbyId) return;

		try {
			await joinLobby(urlLobbyId, nickname.trim());
			// Navigation will be handled by the useEffect above
		} catch (_e) {
			// Error is handled by the store
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	// Show loading while checking if lobby exists
	if (lobbyExists === null) {
		return (
			<Layout>
				<PageContainer>
					<GameCard className="w-full max-w-md text-center">
						<div className="animate-pulse">
							<div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
						</div>
					</GameCard>
				</PageContainer>
			</Layout>
		);
	}

	// Show error if lobby doesn't exist
	if (lobbyExists === false) {
		return (
			<Layout>
				<PageContainer>
					<Header subtitle={t('joinExistingGame')} />

					<GameCard className="w-full max-w-md text-center">
						<div className="space-y-4">
							<div className="text-red-500">
								<h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
									{t('gameNotFound')}
								</h2>
								<p className="text-red-600 dark:text-red-300 mt-2">
									{t('gameCodeDoesNotExist', { code: urlLobbyId })}
								</p>
							</div>

							<Button
								onClick={handleBack}
								variant="outline"
								className="w-full h-12"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								{t('backToHome')}
							</Button>
						</div>
					</GameCard>
				</PageContainer>
			</Layout>
		);
	}

	return (
		<Layout>
			<PageContainer>
				<Header subtitle={t('joinGameNicknameSubtitle')} />

				<GameCard className="w-full max-w-md">
					<form onSubmit={handleJoinLobby} className="space-y-6">
						<div className="text-center">
							<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
								{t('joinGameTitle')}
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								{t('joinGameNicknameSubtitle')}
							</p>
							<div className="mt-3 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
								<p className="text-sm text-green-700 dark:text-green-300">
									{t('gameCode')}:{' '}
									<span className="font-mono font-bold text-lg">
										{urlLobbyId}
									</span>
								</p>
							</div>
						</div>

						<div>
							<Label
								htmlFor={nicknameInputId}
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t('yourNickname')}
							</Label>
							<Input
								id={nicknameInputId}
								type="text"
								value={nickname}
								onChange={(e) => setNickname(e.target.value)}
								placeholder={t('enterNicknamePlaceholder')}
								className="mt-1 h-12 text-base"
								maxLength={20}
								required
								autoFocus
							/>
						</div>

						<div className="flex space-x-3">
							<Button
								type="button"
								onClick={handleBack}
								variant="outline"
								className="flex-1 h-12"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								{t('back')}
							</Button>
							<Button
								type="submit"
								disabled={loading || !nickname.trim()}
								className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
							>
								<LogIn className="mr-2 h-4 w-4" />
								{loading ? t('loading') : t('continue')}
							</Button>
						</div>

						{error && (
							<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-700 text-sm font-medium">{error}</p>
							</div>
						)}
					</form>
				</GameCard>
			</PageContainer>
		</Layout>
	);
}

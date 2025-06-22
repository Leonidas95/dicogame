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
	const { lobbyId: urlLobbyId } = useParams<{ lobbyId: string | undefined }>();
	const [nickname, setNickname] = useState('');
	const [urlLobbyIsSet] = useState<boolean>(!!urlLobbyId);
	const {
		joinLobby,
		loading,
		error,
		lobbyId: currentLobbyId,
		setLobbyId: clearLobbyId,
		setPlayerId,
	} = useGameStore();
	const [nicknameInputId, lobbyIdInputId] = useId();
	const [lobbyId, setLobbyId] = useState('');

	// Navigate to lobby when successfully joined
	useEffect(() => {
		if (currentLobbyId && currentLobbyId.trim() !== '') {
			navigate(`/lobby/${currentLobbyId}`);
		}
	}, [currentLobbyId, navigate]);

	const handleJoinLobby = async (e?: React.FormEvent) => {
		e?.preventDefault();
		const finalLobbyId = urlLobbyId ?? lobbyId;
		if (!nickname.trim() || !finalLobbyId) return;

		try {
			await joinLobby(finalLobbyId, nickname.trim());
			// Navigation will be handled by the useEffect above
		} catch (_e) {
			// Error is handled by the store
		}
	};

	const handleBack = () => {
		// Clear any existing lobby state to prevent infinite loops
		// Set empty strings to clear the state, which will not trigger navigation
		clearLobbyId('');
		setPlayerId('');
		navigate('/');
	};

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
							{urlLobbyIsSet && (
								<div className="mt-3 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
									<p className="text-sm text-green-700 dark:text-green-300">
										{t('gameCode')}:{' '}
										<span className="font-mono font-bold text-lg">
											{urlLobbyId}
										</span>
									</p>
								</div>
							)}
						</div>

						{!urlLobbyIsSet && (
							<div>
								<Label
									htmlFor={lobbyIdInputId}
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{t('gameCode')}
								</Label>
								<Input
									id={lobbyIdInputId}
									type="text"
									value={lobbyId}
									onChange={(e) => setLobbyId(e.target.value.toUpperCase())}
									placeholder={t('enterCodePlaceholder')}
									className="mt-1 h-12 text-base font-mono text-center tracking-widest"
									maxLength={4}
									pattern="[A-Z0-9]{4}"
									required
									autoFocus
								/>
							</div>
						)}

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
								autoFocus={urlLobbyIsSet}
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

import { ArrowLeft, LogIn, Plus } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Language } from '../../api/WordSource';
import { useGameStore } from '../../state/gameStore';
import { Button } from '../ui/button';
import { GameCard } from '../ui/game-card';
import { Header } from '../ui/header';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LanguageSelector } from '../ui/language-selector';
import { Layout, PageContainer } from '../ui/layout';

export default function HomePage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [rounds, setRounds] = useState(2);
	const [nickname, setNickname] = useState('');
	const [lobbyId, setLobbyId] = useState('');
	const [language, setLanguage] = useState<Language | null>(null);
	const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
	const {
		createLobby,
		loading,
		error,
		lobbyId: currentLobbyId,
	} = useGameStore();
	const [lobbyIdInputId, nicknameInputId, roundsInputId] = useId();

	// Navigate to lobby when lobbyId is set in store
	useEffect(() => {
		if (currentLobbyId) {
			navigate(`/lobby/${currentLobbyId}`);
		}
	}, [currentLobbyId, navigate]);

	const handleCreateLobby = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!nickname.trim()) return;
		try {
			await createLobby(nickname.trim(), rounds, language ?? 'en');
			// Navigation will be handled by the useEffect above
		} catch (_e) {
			// Error is handled by the store
		}
	};

	const handleJoinLobby = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!lobbyId.trim()) return;
		// Navigate to join page instead of directly joining
		navigate(`/join/${lobbyId.trim().toUpperCase()}`);
	};

	return (
		<Layout>
			<PageContainer>
				<Header subtitle={t('gameSubtitle')} />

				<GameCard className="w-full max-w-md">
					{mode === 'select' && (
						<div className="space-y-4">
							<div className="text-center mb-6">
								<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
									{t('welcomeTitle')}
								</h2>
								<p className="text-gray-600 dark:text-gray-400 mt-2">
									{t('welcomeSubtitle')}
								</p>
							</div>

							<Button
								onClick={() => setMode('create')}
								className="w-full h-12 text-lg font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
							>
								<Plus className="mr-2 h-5 w-5" />
								{t('createNewGame')}
							</Button>

							<Button
								onClick={() => setMode('join')}
								variant="outline"
								className="w-full h-12 text-lg font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
							>
								<LogIn className="mr-2 h-5 w-5" />
								{t('joinExistingGame')}
							</Button>
						</div>
					)}

					{mode === 'create' && (
						<form onSubmit={handleCreateLobby} className="space-y-6">
							<div className="text-center">
								<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
									{t('createGameTitle')}
								</h2>
								<p className="text-gray-600 dark:text-gray-400 mt-2">
									{t('createGameSubtitle')}
								</p>
							</div>

							<div className="space-y-4">
								<div>
									<Label
										htmlFor="language"
										className="text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										{t('language')}
									</Label>
									<LanguageSelector
										value={language}
										onValueChange={setLanguage}
										disabled={loading}
									/>
								</div>
								<div>
									<Label
										htmlFor={roundsInputId}
										className="text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										{t('numberOfRounds')}
									</Label>
									<Input
										id={roundsInputId}
										type="number"
										value={rounds}
										onChange={(e) => setRounds(parseInt(e.target.value))}
										placeholder={t('enterRoundsPlaceholder')}
										className="mt-1 h-12 text-base"
										maxLength={20}
										required
									/>
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
									/>
								</div>
							</div>

							<div className="flex space-x-3">
								<Button
									type="button"
									onClick={() => setMode('select')}
									variant="outline"
									className="flex-1 h-12"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									{t('back')}
								</Button>
								<Button
									type="submit"
									disabled={loading || !nickname.trim()}
									className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
								>
									{loading ? t('loading') : t('continue')}
								</Button>
							</div>

							{error && (
								<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
									<p className="text-red-700 text-sm font-medium">{error}</p>
								</div>
							)}
						</form>
					)}

					{mode === 'join' && (
						<form onSubmit={handleJoinLobby} className="space-y-6">
							<div className="text-center">
								<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
									{t('joinGameTitle')}
								</h2>
								<p className="text-gray-600 dark:text-gray-400 mt-2">
									{t('joinGameSubtitle')}
								</p>
							</div>

							<div className="space-y-4">
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
									/>
								</div>
							</div>

							<div className="flex space-x-3">
								<Button
									type="button"
									onClick={() => setMode('select')}
									variant="outline"
									className="flex-1 h-12"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									{t('back')}
								</Button>
								<Button
									type="submit"
									disabled={!lobbyId.trim()}
									className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
								>
									<LogIn className="mr-2 h-4 w-4" />
									{loading ? t('loading') : t('continue')}
								</Button>
							</div>
						</form>
					)}

					{error && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-700 text-sm font-medium">{error}</p>
						</div>
					)}
				</GameCard>
			</PageContainer>
		</Layout>
	);
}

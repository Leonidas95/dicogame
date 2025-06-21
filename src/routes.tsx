import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GamePage from './components/Game/GamePage';
import HomePage from './components/Home/HomePage';
import JoinPage from './components/Home/JoinPage';
import LobbyPage from './components/Lobby/LobbyPage';

export default function AppRoutes() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/join/:lobbyId" element={<JoinPage />} />
				<Route path="/lobby/:lobbyId" element={<LobbyPage />} />
				<Route path="/game/:lobbyId" element={<GamePage />} />
			</Routes>
		</BrowserRouter>
	);
}

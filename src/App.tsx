import GameProvider from './components/GameProvider';
import ThemeProvider from './components/ThemeProvider';
import AppRoutes from './routes';

function App() {
	return (
		<ThemeProvider>
			<GameProvider>
				<AppRoutes />
			</GameProvider>
		</ThemeProvider>
	);
}

export default App;

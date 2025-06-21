import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n'; // Initialize i18n
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);

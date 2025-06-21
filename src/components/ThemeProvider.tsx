import { useEffect } from 'react';
import { useThemeStore } from '../state/themeStore';

export default function ThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { theme, setTheme } = useThemeStore();

	useEffect(() => {
		// Initialize theme on mount
		setTheme(theme);
	}, [theme, setTheme]);

	return <>{children}</>;
}

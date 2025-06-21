import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	isDark: boolean;
}

const getSystemTheme = (): boolean => {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getEffectiveTheme = (theme: Theme): boolean => {
	if (theme === 'system') {
		return getSystemTheme();
	}
	return theme === 'dark';
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set, get) => ({
			theme: 'system',
			isDark: false, // Will be set correctly on hydration

			setTheme: (theme: Theme) => {
				const isDark = getEffectiveTheme(theme);
				set({ theme, isDark });

				// Apply theme to document
				if (typeof document !== 'undefined') {
					const root = document.documentElement;
					if (isDark) {
						root.classList.add('dark');
					} else {
						root.classList.remove('dark');
					}
				}
			},

			toggleTheme: () => {
				const { theme } = get();
				const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
				get().setTheme(newTheme);
			},
		}),
		{
			name: 'dico-theme',
			onRehydrateStorage: () => (state) => {
				if (state) {
					// Apply theme on rehydration
					const isDark = getEffectiveTheme(state.theme);
					state.isDark = isDark;

					if (typeof document !== 'undefined') {
						const root = document.documentElement;
						if (isDark) {
							root.classList.add('dark');
						} else {
							root.classList.remove('dark');
						}
					}
				}
			},
		},
	),
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		const { theme } = useThemeStore.getState();
		if (theme === 'system') {
			const isDark = getSystemTheme();
			useThemeStore.setState({ isDark });

			if (typeof document !== 'undefined') {
				const root = document.documentElement;
				if (isDark) {
					root.classList.add('dark');
				} else {
					root.classList.remove('dark');
				}
			}
		}
	});
}

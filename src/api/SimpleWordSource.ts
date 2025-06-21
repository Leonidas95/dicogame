import type { Language, WordSource } from './WordSource';

interface WordData {
	word: string;
	definition: string;
}

export class SimpleWordSource implements WordSource {
	private wordCache: Map<Language, WordData[]> = new Map();
	private loadingPromises: Map<Language, Promise<WordData[]>> = new Map();

	private async loadWordsForLanguage(language: Language): Promise<WordData[]> {
		if (this.wordCache.has(language)) {
			const cachedWords = this.wordCache.get(language);
			if (cachedWords) {
				return cachedWords;
			}
		}

		if (this.loadingPromises.has(language)) {
			const loadingPromise = this.loadingPromises.get(language);
			if (loadingPromise) {
				return loadingPromise;
			}
		}

		const loadingPromise = fetch(`/words/${language}.json`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Failed to load words for language ${language}: ${response.statusText}`,
					);
				}
				return response.json();
			})
			.then((data) => {
				if (!Array.isArray(data)) {
					throw new Error(
						`Invalid data format for language ${language}: expected array`,
					);
				}

				this.wordCache.set(language, data);
				return data;
			})
			.catch((error) => {
				console.error(`Error loading words for language ${language}:`, error);
				return [];
			})
			.finally(() => {
				this.loadingPromises.delete(language);
			});

		this.loadingPromises.set(language, loadingPromise);
		return loadingPromise;
	}

	async getWord(
		language: Language,
		usedWords?: string[],
	): Promise<{ word: string; definition: string }> {
		const words = await this.loadWordsForLanguage(language);

		if (words.length === 0) {
			throw new Error(`No words available for language: ${language}`);
		}

		const availableWords = usedWords
			? words.filter((w) => !usedWords.includes(w.word))
			: words;

		if (availableWords.length === 0) {
			return words[Math.floor(Math.random() * words.length)];
		}

		const randomIndex = Math.floor(Math.random() * availableWords.length);
		return availableWords[randomIndex];
	}

	async preloadLanguage(language: Language): Promise<void> {
		await this.loadWordsForLanguage(language);
	}

	clearCache(): void {
		this.wordCache.clear();
		this.loadingPromises.clear();
	}
}

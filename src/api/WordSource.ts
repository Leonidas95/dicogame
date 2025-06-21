export type Language = 'en' | 'fr';

export interface WordSource {
	getWord(
		language: Language,
		usedWords?: string[],
	): Promise<{ word: string; definition: string }>;
}

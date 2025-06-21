import { useTranslation } from 'react-i18next';
import type { Language } from '../../api/WordSource';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './select';

interface LanguageSelectorProps {
	value: Language | null;
	onValueChange: (value: Language) => void;
	disabled?: boolean;
}

export const languages: {
	value: Language;
	translationKey: string;
	emoji: string;
}[] = [
	{ value: 'en', translationKey: 'languageEnglish', emoji: '🇬🇧' },
	{ value: 'fr', translationKey: 'languageFrench', emoji: '🇫🇷' },
];

export function LanguageSelector({
	value,
	onValueChange,
	disabled,
}: LanguageSelectorProps) {
	const { t } = useTranslation();

	return (
		<Select
			value={value ?? undefined}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<SelectTrigger className="w-full h-12 text-base">
				<SelectValue placeholder={t('selectLanguage')} />
			</SelectTrigger>
			<SelectContent>
				{languages.map((language) => (
					<SelectItem key={language.value} value={language.value}>
						<span className="mr-1">{language.emoji}</span>
						{t(language.translationKey)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

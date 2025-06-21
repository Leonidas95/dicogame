import { BookOpen } from 'lucide-react';

interface HeaderProps {
	title?: string;
	subtitle?: string;
	showLogo?: boolean;
}

export function Header({
	title = 'DicoGame',
	subtitle,
	showLogo = true,
}: HeaderProps) {
	return (
		<div className="text-center mb-8">
			{showLogo && (
				<div className="flex items-center justify-center mb-4">
					<div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-full shadow-lg">
						<BookOpen className="h-8 w-8 text-white" />
					</div>
				</div>
			)}
			<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
				{title}
			</h1>
			{subtitle && (
				<p className="text-gray-600 dark:text-gray-300 text-lg">{subtitle}</p>
			)}
		</div>
	);
}

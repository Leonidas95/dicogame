import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './card';

interface GameCardProps {
	children: ReactNode;
	title?: string;
	description?: string;
	className?: string;
	variant?: 'default' | 'highlight' | 'success' | 'warning';
}

export function GameCard({
	children,
	title,
	description,
	className,
	variant = 'default',
}: GameCardProps) {
	const variantStyles = {
		default: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
		highlight:
			'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20',
		success:
			'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20',
		warning:
			'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20',
	};

	return (
		<Card
			className={cn(
				'shadow-lg border-2 transition-all duration-200 hover:shadow-xl',
				variantStyles[variant],
				className,
			)}
		>
			{(title || description) && (
				<CardHeader className="pb-4">
					{title && <CardTitle className="text-xl">{title}</CardTitle>}
					{description && <CardDescription>{description}</CardDescription>}
				</CardHeader>
			)}
			<CardContent className="pt-0">{children}</CardContent>
		</Card>
	);
}

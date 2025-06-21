import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface LoadingProps {
	text?: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export function Loading({ text, size = 'md', className }: LoadingProps) {
	const { t } = useTranslation();
	const displayText = text || t('loading');

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8',
	};

	return (
		<div
			className={cn('flex items-center justify-center space-x-2', className)}
		>
			<Loader2
				className={cn('animate-spin text-green-600', sizeClasses[size])}
			/>
			<span className="text-gray-600 dark:text-gray-400">{displayText}</span>
		</div>
	);
}

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export function LoadingSpinner({
	size = 'md',
	className,
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8',
	};

	return (
		<Loader2
			className={cn(
				'animate-spin text-green-600',
				sizeClasses[size],
				className,
			)}
		/>
	);
}

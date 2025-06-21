import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from './theme-toggle';

interface LayoutProps {
	children: ReactNode;
	className?: string;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Layout({ children, className, maxWidth = 'xl' }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="fixed top-4 right-4 z-50">
				<ThemeToggle />
			</div>
			<div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
				<div
					className={cn(
						'mx-auto',
						{
							'max-w-sm': maxWidth === 'sm',
							'max-w-md': maxWidth === 'md',
							'max-w-lg': maxWidth === 'lg',
							'max-w-xl': maxWidth === 'xl',
							'max-w-2xl': maxWidth === '2xl',
						},
						className,
					)}
				>
					{children}
				</div>
			</div>
		</div>
	);
}

interface PageContainerProps {
	children: ReactNode;
	className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center min-h-[calc(100vh-3rem)]',
				className,
			)}
		>
			{children}
		</div>
	);
}

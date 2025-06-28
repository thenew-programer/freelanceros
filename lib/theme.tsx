'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('light');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check for saved theme preference or default to light
		// const savedTheme = localStorage.getItem('theme') as Theme;
		const savedTheme = 'light';
		if (savedTheme) {
			setTheme(savedTheme);
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			setTheme('dark');
		}
	}, []);

	useEffect(() => {
		if (!mounted) return;

		// Apply theme to document
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);
		localStorage.setItem('theme', theme);
	}, [theme, mounted]);

	const toggleTheme = () => {
		setTheme(prev => prev === 'light' ? 'dark' : 'light');
	};

	// Prevent hydration mismatch
	if (!mounted) {
		return <>{children}</>;
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}

const themedRoutes = [
	'/dashboard',
	'/clients',
	'/proposals',
	'/projects',
	'/invoices',
	'/time-tracking',
	'/security',
	'/settings',
	'/profile',
];

const isThemedRoute = (pathname: string): boolean => {
	return themedRoutes.some(route => pathname.startsWith(route));
};


interface ConditionalThemeProviderProps {
	children: ReactNode;
}

export function ConditionalThemeProvider({ children }: ConditionalThemeProviderProps) {
	const pathname = usePathname();
	const shouldUseTheme = isThemedRoute(pathname);

	if (shouldUseTheme) {
		return <ThemeProvider>{children}</ThemeProvider>;
	}

	return <>{children}</>;
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ConditionalThemeProvider } from '@/lib/theme';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'FreelancerOS - Complete Freelancer Operating System',
	description: 'Manage proposals, track projects, log time, and grow your freelance business with our comprehensive platform.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ConditionalThemeProvider>
					{children}
					<Toaster />
				</ConditionalThemeProvider>
			</body>
		</html>
	);
}

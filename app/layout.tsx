import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ConditionalThemeProvider } from '@/lib/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: {
		default: 'FreelancerOS - Complete Freelancer Operating System',
		template: '%s | FreelancerOS'
	},
	description: 'Comprehensive freelance management platform with smart proposal generation, milestone tracking, and secure client portals. Built with Next.js and Supabase.',
	keywords: [
		'freelancer',
		'project management',
		'proposals',
		'time tracking',
		'client portal',
		'freelance business',
		'milestone tracking',
		'invoicing'
	],
	authors: [{ name: 'FreelancerOS Team' }],
	creator: 'FreelancerOS',
	publisher: 'FreelancerOS',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL('https://freelanceros.netlify.app'), // Update with your actual domain
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://freelanceros.netlify.app', // Update with your actual domain
		title: 'FreelancerOS - Complete Freelancer Operating System',
		description: 'Comprehensive freelance management platform with smart proposal generation, milestone tracking, and secure client portals.',
		siteName: 'FreelancerOS',
		images: [
			{
				url: '/freelanceros.png', // You'll need to create this
				width: 1200,
				height: 630,
				alt: 'FreelancerOS - Freelance Management Platform',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'FreelancerOS - Complete Freelancer Operating System',
		description: 'Comprehensive freelance management platform with smart proposal generation, milestone tracking, and secure client portals.',
		images: ['/freelanceros.png'], // Same image as OpenGraph
		creator: '@youssef_bouryal', // Update with your Twitter handle
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	icons: {
		icon: [
			{ url: '/favicon.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon.png', sizes: '32x32', type: 'image/png' },
		],
	},
	manifest: '/site.webmanifest',
	verification: {
		google: 'your-google-verification-code', // Add when you set up Google Search Console
		// yandex: 'your-yandex-verification-code',
		// bing: 'your-bing-verification-code',
	},
	category: 'technology',
	applicationName: 'FreelancerOS',
	referrer: 'origin-when-cross-origin',
	appLinks: {
		web: {
			url: 'https://freelanceros.netlify.app',
			should_fallback: true,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Additional meta tags */}
				<meta name="theme-color" content="#000000" />
				<meta name="msapplication-TileColor" content="#000000" />

				{/* Preload critical fonts */}
				<link
					rel="preload"
					href="/fonts/inter-var.woff2"
					as="font"
					type="font/ttf"
					crossOrigin="anonymous"
				/>

				{/* DNS prefetch for external domains */}
				<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
				<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
			</head>
			<body className={inter.className}>
				<ConditionalThemeProvider>
					{children}
					<Toaster />
				</ConditionalThemeProvider>
			</body>
		</html>
	);
}

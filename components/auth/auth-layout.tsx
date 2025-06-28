import { ReactNode } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	subtitle: string;
	showBackToSignIn?: boolean;
}

export function AuthLayout({ children, title, subtitle, showBackToSignIn = false }: AuthLayoutProps) {
	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto px-4 py-8">
				{/* Back Home Button - Top Left */}
				<Link
					href="/"
					className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
				>
					<ArrowLeft className="w-4 h-4" />
					Back Home
				</Link>
				<div className="flex min-h-screen items-center justify-center">
					<div className="w-full max-w-md">

						{/* Logo */}
						<div className="mb-8 text-center">
							<Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-black">
								<div className="rounded-lg bg-white dark:bg-black p-2">
									<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
								</div>
								FreelancerOS
							</Link>
						</div>

						{/* Auth Card */}
						<div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-lg">
							<div className="mb-6 text-center">
								<h1 className="text-2xl font-bold text-black">{title}</h1>
								<p className="mt-2 text-gray-600">{subtitle}</p>
							</div>

							{children}

							{showBackToSignIn && (
								<div className="mt-6 text-center">
									<Link
										href="/auth/signin"
										className="text-sm text-black hover:text-gray-600 transition-colors"
									>
										← Back to sign in
									</Link>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="mt-8 text-center text-sm text-gray-500">
							<p>© 2025 FreelancerOS. Built for professional freelancers.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

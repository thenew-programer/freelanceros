'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp, signInWithProvider } from '@/lib/auth';
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth';
import { toast } from 'sonner';

export default function SignUpPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpInput>({
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = async (data: SignUpInput) => {
		setIsLoading(true);

		try {
			const { data: authData, error } = await signUp(data.email, data.password, data.fullName);

			if (error) {
				toast.error(error.message);
				return;
			}

			if (authData.user) {
				toast.success('Account created successfully! Please check your email to verify your account.');
				router.push('/auth/signin');
			}
		} catch (error) {
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthSignUp = async (provider: 'google' | 'github') => {
		setIsOAuthLoading(provider);

		try {
			const { error } = await signInWithProvider(provider);

			if (error) {
				console.error(`${provider} sign up error:`, error);
				toast.error(`Failed to sign up with ${provider}. Please try again.`);
			}
		} catch (error) {
			console.error(`Unexpected ${provider} sign up error:`, error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsOAuthLoading(null);
		}
	};

	return (
		<AuthLayout
			title="Create your account"
			subtitle="Join thousands of freelancers managing their business with FreelancerOS"
		>
			<div className="space-y-6">
				{/* OAuth Providers */}
				<div className="space-y-3">
					<Button
						type="button"
						variant="outline"
						className="w-full border-gray-300 hover:bg-gray-50"
						onClick={() => handleOAuthSignUp('google')}
						disabled={isOAuthLoading !== null || isLoading}
					>
						{isOAuthLoading === 'google' ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
						)}
						Continue with Google
					</Button>

					<Button
						type="button"
						variant="outline"
						className="w-full border-gray-300 hover:bg-gray-50"
						onClick={() => handleOAuthSignUp('github')}
						disabled={isOAuthLoading !== null || isLoading}
					>
						{isOAuthLoading === 'github' ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
							</svg>
						)}
						Continue with GitHub
					</Button>
				</div>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-gray-300" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-gray-500">Or continue with email</span>
					</div>
				</div>

				{/* Email/Password Form */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Full Name */}
					<div className="space-y-2">
						<Label htmlFor="fullName" className="text-black">Full Name</Label>
						<div className="relative">
							<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								id="fullName"
								type="text"
								placeholder="Enter your full name"
								className="pl-10 border-gray-300 focus:border-black focus:ring-black"
								{...register('fullName')}
							/>
						</div>
						{errors.fullName && (
							<p className="text-sm text-red-600">{errors.fullName.message}</p>
						)}
					</div>

					{/* Email */}
					<div className="space-y-2">
						<Label htmlFor="email" className="text-black">Email</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								className="pl-10 border-gray-300 focus:border-black focus:ring-black"
								{...register('email')}
							/>
						</div>
						{errors.email && (
							<p className="text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>

					{/* Password */}
					<div className="space-y-2">
						<Label htmlFor="password" className="text-black">Password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Create a password"
								className="pl-10 pr-10 border-gray-300 focus:border-black focus:ring-black"
								{...register('password')}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{errors.password && (
							<p className="text-sm text-red-600">{errors.password.message}</p>
						)}
					</div>

					{/* Confirm Password */}
					<div className="space-y-2">
						<Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="Confirm your password"
								className="pl-10 pr-10 border-gray-300 focus:border-black focus:ring-black"
								{...register('confirmPassword')}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
							>
								{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
						)}
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full bg-black text-white hover:bg-gray-800"
						disabled={isLoading || isOAuthLoading !== null}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating account...
							</>
						) : (
							'Create account'
						)}
					</Button>

					{/* Sign In Link */}
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{' '}
							<Link href="/auth/signin" className="text-black hover:text-gray-600 font-medium">
								Sign in
							</Link>
						</p>
					</div>
				</form>
			</div>
		</AuthLayout>
	);
}

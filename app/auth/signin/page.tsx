'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Gavel } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import { signInSchema, type SignInInput } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isJuryLoading, setIsJuryLoading] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInInput>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInInput) => {
		setIsLoading(true);

		try {
			console.log('Starting sign in...');
			const { data: authData, error } = await signIn(data.email, data.password);

			if (error) {
				console.error('Sign in error:', error);
				toast.error(error.message);
				return;
			}

			console.log('Sign in successful:', authData);

			if (authData.user) {
				toast.success('Welcome back!');
				router.push('/dashboard');
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleJuryLogin = async () => {
		setIsJuryLoading(true);

		try {
			console.log('Starting jury sign in...');
			const { data: authData, error } = await signIn('test@gmail.com', 'test1234');

			if (error) {
				console.error('Jury sign in error:', error);
				toast.error(error.message);
				return;
			}

			console.log('Jury sign in successful:', authData);

			if (authData.user) {
				toast.success('Welcome, Jury Member!');
				router.push('/dashboard');
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsJuryLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Welcome back"
			subtitle="Sign in to your FreelancerOS account to continue"
		>
			<div className="space-y-6">
				{/* Social Login Options */}
				<div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
					<h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2 mb-3">
						<Gavel className="h-4 w-4" />
						Quick Access
					</h3>
					<div className="grid grid-cols-3 gap-3">
						{/* Jury Login */}
						<Button
							type="button"
							onClick={handleJuryLogin}
							disabled={isJuryLoading || isLoading}
							className="bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center py-3 h-auto"
						>
							{isJuryLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mb-1" />
									<span className="text-xs">Signing in...</span>
								</>
							) : (
								<>
									<Gavel className="h-4 w-4 mb-1" />
									<span className="text-xs">Jury Login</span>
								</>
							)}
						</Button>

						{/* GitHub Login */}
						<Button
							type="button"
							variant="outline"
							className="border-gray-300 hover:bg-gray-50 flex flex-col items-center py-3 h-auto"
						>
							<svg className="h-4 w-4 mb-1" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
							</svg>
							<span className="text-xs">GitHub</span>
						</Button>

						{/* Google Login */}
						<Button
							type="button"
							variant="outline"
							className="border-gray-300 hover:bg-gray-50 flex flex-col items-center py-3 h-auto"
						>
							<svg className="h-4 w-4 mb-1" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
							</svg>
							<span className="text-xs">Google</span>
						</Button>
					</div>
				</div>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-gray-200" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-gray-500">Or continue with your account</span>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
						<div className="flex items-center justify-between">
							<Label htmlFor="password" className="text-black">Password</Label>
							<Link
								href="/auth/forgot-password"
								className="text-sm text-black hover:text-gray-600"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your password"
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

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full bg-black text-white hover:bg-gray-800"
						disabled={isLoading || isJuryLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							'Sign in'
						)}
					</Button>

					{/* Sign Up Link */}
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{' '}
							<Link href="/auth/signup" className="text-black hover:text-gray-600 font-medium">
								Sign up
							</Link>
						</p>
					</div>
				</form>
			</div>
		</AuthLayout>
	);
}

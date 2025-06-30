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
				{/* Hackathon Jury Button */}
				<div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
								<Gavel className="h-4 w-4" />
								Hackathon Jury Access
							</h3>
							<p className="text-xs text-purple-700 mt-1">
								Quick access for hackathon evaluation and judging
							</p>
						</div>
						<Button
							type="button"
							onClick={handleJuryLogin}
							disabled={isJuryLoading || isLoading}
							className="bg-purple-600 hover:bg-purple-700 text-white"
						>
							{isJuryLoading ? (
								<>
									<Loader2 className="mr-2 h-3 w-3 animate-spin" />
									Signing in...
								</>
							) : (
								<>
									<Gavel className="mr-2 h-3 w-3" />
									Jury Login
								</>
							)}
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

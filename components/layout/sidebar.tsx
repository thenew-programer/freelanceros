'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	BriefcaseBusiness,
	LayoutDashboard,
	FileText,
	FolderOpen,
	Clock,
	Settings,
	Menu,
	Sun,
	Moon,
	LogOut,
	User,
	Shield,
	PanelLeftClose,
	PanelLeftOpen,
	Users,
	Receipt,
	CreditCard,
	Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/theme';
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/supabase';

const navigation = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Clients', href: '/clients', icon: Users },
	{ name: 'Proposals', href: '/proposals', icon: FileText },
	{ name: 'Projects', href: '/projects', icon: FolderOpen },
	{ name: 'Invoices', href: '/invoices', icon: Receipt },
	{ name: 'Time Tracking', href: '/time-tracking', icon: Clock },
	{ name: 'Security', href: '/security', icon: Shield },
	{ name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
	className?: string;
	onSignOut: () => void;
	userEmail?: string;
	subscription?: any;
}

export function Sidebar({ className, onSignOut, userEmail, subscription }: SidebarProps) {
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [profile, setProfile] = useState<Profile | null>(null);
	const { theme, toggleTheme } = useTheme();
	const { isCollapsed, toggleSidebar } = useSidebarStore();
	const pathname = usePathname();

	// Close mobile sidebar when route changes
	useEffect(() => {
		setIsMobileOpen(false);
	}, [pathname]);

	// Load user profile for avatar
	useEffect(() => {
		async function loadProfile() {
			try {
				const { user } = await getCurrentUser();
				if (!user) return;

				const { data } = await getProfile(user.id);
				if (data) {
					setProfile(data);
				}
			} catch (error) {
				// Silently fail - we'll just show the fallback icon
			}
		}

		loadProfile();
	}, []);

	const isPremium = subscription && subscription.plan.price_monthly > 0;

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsMobileOpen(!isMobileOpen)}
					className="border-gray-300 dark:border-gray-600 bg-white dark:bg-black shadow-lg"
				>
					<Menu className="h-4 w-4" />
				</Button>
			</div>

			{/* Overlay for mobile */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			{/* Sidebar - Fixed height and no scrolling */}
			<div className={cn(
				"bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out overflow-y-hidden relative",
				// Mobile behavior - keep fixed
				"fixed inset-y-0 left-0 z-50 w-80",
				isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
				// Desktop behavior - responsive width
				"lg:flex lg:flex-col",
				isCollapsed ? "lg:w-16" : "lg:w-64",
				className
			)}>
				{/* Fixed container with proper height boundaries and NO SCROLLING */}
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className={cn(

						"flex items-center border-b border-gray-200 dark:border-gray-800 transition-all duration-300 flex-shrink-0 relative",
						isCollapsed ? "lg:justify-center lg:p-4" : "lg:p-6",
						"p-6" // Mobile always full padding
					)}>
						<div className={cn(
							"flex items-center gap-2 transition-all duration-300",
							isCollapsed && "lg:justify-center"
						)}>
							<div className="rounded-lg bg-white dark:bg-black p-2 flex-shrink-0">
								<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
							</div>
							<span className={cn(
								"text-xl font-bold text-black dark:text-white transition-all duration-300",
								isCollapsed && "lg:hidden"
							)}>
								FreelancerOS
							</span>

							{isPremium && !isCollapsed && (
								<Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
									PRO
								</Badge>
							)}
						</div>
					</div>

					{/* Desktop toggle button - positioned on the border */}
					<div className="hidden lg:block absolute left-0 top-[73px] w-full">
						<div className="relative">
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleSidebar}
								className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all duration-300 rounded-full w-6 h-6 p-0 shadow-sm z-10"
								title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
							>
								{isCollapsed ? (
									<PanelLeftOpen className="h-3 w-3" />
								) : (
									<PanelLeftClose className="h-3 w-3" />
								)}
							</Button>
						</div>
					</div>

					{/* Navigation - At the top, no extra margin */}
					<nav className={cn(
						"px-4 pt-6 pb-4 space-y-2 transition-all duration-300 flex-shrink-0",
						isCollapsed && "lg:px-2"
					)}>
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									onClick={() => setIsMobileOpen(false)}
									className={cn(
										"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
										isActive
											? "bg-black dark:bg-white text-white dark:text-black"
											: "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-900",
										isCollapsed && "lg:justify-center lg:px-2"
									)}
									title={isCollapsed ? item.name : undefined}
								>
									<item.icon className={cn(
										"h-5 w-5 flex-shrink-0",
										isActive
											? "text-white dark:text-black"
											: "text-gray-700 dark:text-slate-300"
									)} />
									<span className={cn(
										"transition-all duration-300",
										isCollapsed && "lg:hidden"
									)}>
										{item.name}
									</span>
								</Link>
							);
						})}

						{/* Subscription Link */}
						<Link
							href="/settings/billing"
							onClick={() => setIsMobileOpen(false)}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
								pathname === "/settings/billing"
									? "bg-black dark:bg-white text-white dark:text-black"
									: "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-900",
								isCollapsed && "lg:justify-center lg:px-2"
							)}
							title={isCollapsed ? "Subscription" : undefined}
						>
							<CreditCard className={cn(
								"h-5 w-5 flex-shrink-0",
								pathname === "/settings/billing"
									? "text-white dark:text-black"
									: "text-gray-700 dark:text-slate-300"
							)} />
							<span className={cn(
								"transition-all duration-300",
								isCollapsed && "lg:hidden"
							)}>
								Subscription
							</span>
						</Link>

						{/* Pricing Link */}
						<Link
							href="/pricing"
							onClick={() => setIsMobileOpen(false)}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
								pathname === "/pricing"
									? "bg-black dark:bg-white text-white dark:text-black"
									: "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-900",
								isCollapsed && "lg:justify-center lg:px-2"
							)}
							title={isCollapsed ? "Pricing" : undefined}
						>
							<Zap className={cn(
								"h-5 w-5 flex-shrink-0",
								pathname === "/pricing"
									? "text-white dark:text-black"
									: "text-gray-700 dark:text-slate-300"
							)} />
							<span className={cn(
								"transition-all duration-300",
								isCollapsed && "lg:hidden"
							)}>
								Pricing
							</span>
						</Link>
					</nav>

					{/* Spacer to push user section to bottom */}
					<div className="flex-1"></div>

					{/* User Section - Fixed at bottom, NO SCROLLING */}
					<div className={cn(
						"p-4 border-t border-gray-200 dark:border-gray-800 space-y-3 transition-all duration-300 flex-shrink-0",
						isCollapsed && "lg:px-2"
					)}>
						{/* User Info - Avatar as link to profile */}
						<Link
							href="/profile"
							onClick={() => setIsMobileOpen(false)}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300",
								isCollapsed && "lg:justify-center lg:px-2"
							)}
							title={isCollapsed ? "Profile" : undefined}
						>
							<div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
								{profile?.avatar_url ? (
									<img
										src={profile.avatar_url}
										alt={profile.full_name || 'Profile'}
										className="w-full h-full object-cover"
									/>
								) : (
									<User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
								)}
							</div>
							<div className={cn(
								"flex-1 min-w-0 transition-all duration-300",
								isCollapsed && "lg:hidden"
							)}>
								<p className="text-sm font-medium text-black dark:text-white truncate">
									{profile?.full_name || userEmail || 'User'}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									{profile?.title || 'Freelancer'}
								</p>
							</div>
						</Link>

						<div className={cn(
							"space-y-1",
							isCollapsed && "lg:flex lg:flex-col lg:items-center lg:space-y-2"
						)}>

							{/* Sign Out */}
							<Button
								variant="ghost"
								onClick={onSignOut}
								className={cn(
									"font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300",
									isCollapsed
										? "lg:w-8 lg:h-8 lg:p-0 lg:justify-center"
										: "w-full justify-start gap-3 px-3 py-2"
								)}
								title={isCollapsed ? "Sign Out" : undefined}
							>
								<LogOut className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
								<span className={cn(
									"transition-all duration-300",
									isCollapsed && "lg:hidden"
								)}>
									Sign Out
								</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

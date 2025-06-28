'use client';

import Link from 'next/link';
import { BriefcaseBusiness, ArrowRight, Users, Clock, FileText, BarChart3, CheckCircle, Star, CreditCard, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
	return (
		<div className="min-h-screen bg-white relative">
			{/* SVG Logos */}
			<a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="absolute top-20 right-4 z-50">
				<img src="/bolt-logo.svg" alt="Logo" className="w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-90 hover:opacity-100 transition-opacity duration-200" />
			</a>
			<a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-50">
				<img src="/bolt-logo.svg" alt="Logo" className="w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-90 hover:opacity-100 transition-opacity duration-200" />
			</a>
			{/* Navigation */}
			<nav className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="rounded-lg bg-white dark:bg-black p-2 flex-shrink-0">
							<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
						</div>
						<span className="text-2xl font-bold text-black">FreelancerOS</span>
					</div>

					<div className="hidden md:flex items-center gap-8">
						<Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link>
						<Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</Link>
						<Link href="/testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</Link>
						<Link href="/blog" className="text-gray-600 hover:text-black transition-colors">Blog</Link>
					</div>

					<div className="flex items-center gap-4">
						<Button asChild variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
							<Link href="/auth/signin">Sign In</Link>
						</Button>
						<Button asChild className="bg-black text-white hover:bg-gray-800">
							<Link href="/auth/signup">Get Started</Link>
						</Button>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="py-20 md:py-28 relative overflow-hidden">
				<style jsx>{`
		@keyframes moveAcross1 {
			0% { transform: translate(-100px, -50px) rotate(0deg); }
			25% { transform: translate(200px, 100px) rotate(90deg); }
			50% { transform: translate(500px, -100px) rotate(180deg); }
			75% { transform: translate(800px, 150px) rotate(270deg); }
			100% { transform: translate(1200px, -50px) rotate(360deg); }
		}
		@keyframes moveAcross2 {
			0% { transform: translate(1200px, 200px) rotate(0deg); }
			25% { transform: translate(800px, -80px) rotate(-90deg); }
			50% { transform: translate(400px, 180px) rotate(-180deg); }
			75% { transform: translate(100px, -120px) rotate(-270deg); }
			100% { transform: translate(-100px, 100px) rotate(-360deg); }
		}
		@keyframes moveAcross3 {
			0% { transform: translate(600px, -100px) rotate(45deg); }
			25% { transform: translate(-50px, 50px) rotate(135deg); }
			50% { transform: translate(900px, 200px) rotate(225deg); }
			75% { transform: translate(200px, -150px) rotate(315deg); }
			100% { transform: translate(600px, 100px) rotate(405deg); }
		}
		@keyframes moveAcross4 {
			0% { transform: translate(300px, 300px) rotate(30deg); }
			25% { transform: translate(700px, -50px) rotate(120deg); }
			50% { transform: translate(-100px, 150px) rotate(210deg); }
			75% { transform: translate(1000px, 50px) rotate(300deg); }
			100% { transform: translate(300px, -100px) rotate(390deg); }
		}
		@keyframes moveAcross5 {
			0% { transform: translate(1000px, 50px) rotate(-30deg); }
			25% { transform: translate(150px, 250px) rotate(-120deg); }
			50% { transform: translate(750px, -200px) rotate(-210deg); }
			75% { transform: translate(-50px, 100px) rotate(-300deg); }
			100% { transform: translate(850px, 200px) rotate(-390deg); }
		}
		@keyframes moveAcross6 {
			0% { transform: translate(0px, 150px) rotate(60deg); }
			25% { transform: translate(500px, -100px) rotate(150deg); }
			50% { transform: translate(1100px, 250px) rotate(240deg); }
			75% { transform: translate(300px, 0px) rotate(330deg); }
			100% { transform: translate(-150px, 180px) rotate(420deg); }
		}
		@keyframes moveAcross7 {
			0% { transform: translate(800px, -150px) rotate(-60deg); }
			25% { transform: translate(100px, 180px) rotate(-150deg); }
			50% { transform: translate(600px, 80px) rotate(-240deg); }
			75% { transform: translate(1200px, -80px) rotate(-330deg); }
			100% { transform: translate(200px, 220px) rotate(-420deg); }
		}
		@keyframes moveAcross8 {
			0% { transform: translate(400px, 250px) rotate(15deg); }
			25% { transform: translate(900px, -120px) rotate(105deg); }
			50% { transform: translate(50px, 120px) rotate(195deg); }
			75% { transform: translate(700px, 180px) rotate(285deg); }
			100% { transform: translate(1100px, -50px) rotate(375deg); }
		}
		}
		.floating-logo-1 { animation: moveAcross1 8s ease-in-out infinite; }
		.floating-logo-2 { animation: moveAcross2 10s ease-in-out infinite 1s; }
		.floating-logo-3 { animation: moveAcross3 7s ease-in-out infinite 2s; }
		.floating-logo-4 { animation: moveAcross4 12s ease-in-out infinite 0.5s; }
		.floating-logo-5 { animation: moveAcross5 9s ease-in-out infinite 3s; }
		.floating-logo-6 { animation: moveAcross6 11s ease-in-out infinite 1.5s; }
		.floating-logo-7 { animation: moveAcross7 6s ease-in-out infinite 4s; }
		.floating-logo-8 { animation: moveAcross8 8.5s ease-in-out infinite 2.5s; }
		.floating-logo-9 { animation: moveAcross1 9.5s ease-in-out infinite 3.5s; }
		.floating-logo-10 { animation: moveAcross2 7.5s ease-in-out infinite 0.8s; }
		.floating-logo-11 { animation: moveAcross3 10.5s ease-in-out infinite 4.2s; }
		.floating-logo-12 { animation: moveAcross4 6.8s ease-in-out infinite 1.8s; }
	`}</style>

				{/* Scattered Floating Logo Background */}
				<div className="absolute inset-0 pointer-events-none">
					{/* Top scattered logos */}
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-10 left-10 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-1" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-20 right-20 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-2" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-32 left-1/4 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-3" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-16 right-1/3 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-4" />

					{/* Middle scattered logos */}
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-1/2 left-16 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-5 transform -translate-y-1/2" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-1/2 right-16 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-6 transform -translate-y-1/2" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-1/2 left-1/3 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-7 transform -translate-y-1/2" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute top-1/2 right-1/4 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-8 transform -translate-y-1/2" />

					{/* Bottom scattered logos */}
					<img src="/bolt-logo.svg" alt="Logo" className="absolute bottom-20 left-20 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-9" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute bottom-32 right-32 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-10" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute bottom-16 left-1/3 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-11" />
					<img src="/bolt-logo.svg" alt="Logo" className="absolute bottom-28 right-1/5 w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-20 floating-logo-12" />
				</div>

				<div className="container mx-auto px-4 text-center relative z-10">
					<Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm py-1.5 px-4">
						Trusted by 10,000+ freelancers worldwide
					</Badge>

					<h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
						The Complete
						<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							{' '}Freelancer{' '}
						</span>
						Operating System
					</h1>

					<p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
						Manage proposals, track projects, log time, and grow your freelance business
						with our comprehensive platform built specifically for independent professionals.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
							<Link href="/auth/signup" className="flex items-center gap-2">
								Start Free Trial
								<ArrowRight className="h-5 w-5" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="border-gray-300 text-black hover:bg-gray-50 px-8 py-6 text-lg">
							<Link href="/pricing">View Pricing</Link>
						</Button>
					</div>

					<div className="mt-10 text-gray-500 flex items-center justify-center gap-6">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-green-500" />
							<span>No credit card required</span>
						</div>
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-green-500" />
							<span>14-day free trial</span>
						</div>
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-green-500" />
							<span>Cancel anytime</span>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
							Features
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Everything you need to run your freelance business
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							FreelancerOS combines all the tools you need into one seamless platform,
							saving you time and helping you look professional.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="rounded-lg bg-blue-100 p-3 w-fit mb-6">
								<FileText className="h-6 w-6 text-blue-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Smart Proposals</h3>
							<p className="text-gray-600 mb-4">Create professional proposals with templates and automated workflows that win more clients.</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Customizable templates</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Electronic signatures</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Automatic follow-ups</span>
								</li>
							</ul>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="rounded-lg bg-green-100 p-3 w-fit mb-6">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Project Management</h3>
							<p className="text-gray-600 mb-4">Track milestones, deadlines, and deliverables with client portals that keep everyone on the same page.</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Milestone tracking</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Client collaboration</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">File sharing</span>
								</li>
							</ul>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="rounded-lg bg-yellow-100 p-3 w-fit mb-6">
								<Clock className="h-6 w-6 text-yellow-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Time Tracking</h3>
							<p className="text-gray-600 mb-4">Log hours automatically and generate detailed time reports to maximize your billable hours.</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">One-click timer</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Automatic invoicing</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Detailed reports</span>
								</li>
							</ul>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="rounded-lg bg-purple-100 p-3 w-fit mb-6">
								<CreditCard className="h-6 w-6 text-purple-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Professional Invoicing</h3>
							<p className="text-gray-600 mb-4">Create beautiful, customizable invoices that get you paid faster with online payment options.</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Custom branding</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Recurring invoices</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Payment reminders</span>
								</li>
							</ul>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="rounded-lg bg-red-100 p-3 w-fit mb-6">
								<BarChart3 className="h-6 w-6 text-red-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Business Analytics</h3>
							<p className="text-gray-600 mb-4">Gain insights into your business performance and growth with detailed analytics dashboards.</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Income forecasting</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Client insights</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Productivity metrics</span>
								</li>
							</ul>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
							<div className="rounded-lg bg-indigo-100 p-3 w-fit mb-6">
								<Globe className="h-6 w-6 text-indigo-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Client Portal</h3>
							<p className="text-gray-600 mb-4">Give clients a professional, branded experience with secure access to projects and files.</p>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Secure sharing</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Progress tracking</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-500" />
									<span className="text-gray-700">Feedback collection</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
							How It Works
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Streamline your freelance workflow
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							FreelancerOS helps you manage every aspect of your freelance business in one place.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<span className="text-2xl font-bold text-blue-600">1</span>
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Create Proposals</h3>
							<p className="text-gray-600">
								Create professional proposals that win clients using our customizable templates and automated follow-ups.
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<span className="text-2xl font-bold text-green-600">2</span>
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Manage Projects</h3>
							<p className="text-gray-600">
								Track milestones, deadlines, and deliverables with our intuitive project management tools.
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<span className="text-2xl font-bold text-purple-600">3</span>
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Get Paid Faster</h3>
							<p className="text-gray-600">
								Create professional invoices, track payments, and set up recurring billing to improve your cash flow.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
							Testimonials
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Loved by freelancers worldwide
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							See what other freelancers are saying about how FreelancerOS has transformed their business.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<p className="text-gray-700 mb-6">
								"FreelancerOS has completely transformed how I manage my web design business. The proposal templates alone have increased my conversion rate by 40%!"
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
									<span className="text-blue-600 font-bold">JS</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Jessica Smith</h4>
									<p className="text-gray-500 text-sm">Web Designer</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<p className="text-gray-700 mb-6">
								"The time tracking and invoicing features have saved me hours each week. I'm now able to focus on my clients instead of administrative tasks."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
									<span className="text-green-600 font-bold">MJ</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Michael Johnson</h4>
									<p className="text-gray-500 text-sm">Marketing Consultant</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<p className="text-gray-700 mb-6">
								"As a freelance developer, I needed a system to keep track of multiple projects. FreelancerOS has been a game-changer for my productivity and client relationships."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
									<span className="text-purple-600 font-bold">AT</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Alex Thompson</h4>
									<p className="text-gray-500 text-sm">Software Developer</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-4 gap-8 text-center">
						<div>
							<p className="text-4xl font-bold text-black mb-2">10,000+</p>
							<p className="text-gray-600">Freelancers</p>
						</div>
						<div>
							<p className="text-4xl font-bold text-black mb-2">$50M+</p>
							<p className="text-gray-600">Invoiced through platform</p>
						</div>
						<div>
							<p className="text-4xl font-bold text-black mb-2">25,000+</p>
							<p className="text-gray-600">Projects completed</p>
						</div>
						<div>
							<p className="text-4xl font-bold text-black mb-2">98%</p>
							<p className="text-gray-600">Customer satisfaction</p>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Preview */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
							Pricing
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Simple, transparent pricing
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Choose the plan that's right for your freelance business. All plans include core features with different usage limits.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						<div className="bg-white p-8 rounded-2xl border-2 border-gray-200 relative">
							<h3 className="text-2xl font-bold text-black mb-2">Free</h3>
							<p className="text-4xl font-bold text-black mb-4">$0<span className="text-gray-500 text-lg font-normal">/month</span></p>
							<p className="text-gray-600 mb-6">Perfect for freelancers just getting started</p>

							<ul className="space-y-3 mb-8">
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">3 clients</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">5 proposals</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Basic invoicing</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Time tracking</span>
								</li>
							</ul>

							<Button asChild className="w-full bg-white text-black border-2 border-black hover:bg-gray-50">
								<Link href="/auth/signup">Get Started</Link>
							</Button>
						</div>

						<div className="bg-white p-8 rounded-2xl border-2 border-black shadow-lg relative">
							<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
								<Badge className="bg-black text-white hover:bg-black">Most Popular</Badge>
							</div>
							<h3 className="text-2xl font-bold text-black mb-2">Pro</h3>
							<p className="text-4xl font-bold text-black mb-4">$19<span className="text-gray-500 text-lg font-normal">/month</span></p>
							<p className="text-gray-600 mb-6">For growing freelance businesses</p>

							<ul className="space-y-3 mb-8">
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Unlimited clients</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Unlimited proposals</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Advanced invoicing</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Client portal</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Custom branding</span>
								</li>
							</ul>

							<Button asChild className="w-full bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">Start Free Trial</Link>
							</Button>
						</div>

						<div className="bg-white p-8 rounded-2xl border-2 border-gray-200 relative">
							<h3 className="text-2xl font-bold text-black mb-2">Business</h3>
							<p className="text-4xl font-bold text-black mb-4">$49<span className="text-gray-500 text-lg font-normal">/month</span></p>
							<p className="text-gray-600 mb-6">For freelance agencies and teams</p>

							<ul className="space-y-3 mb-8">
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Everything in Pro</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Team collaboration</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Advanced analytics</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">API access</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
									<span className="text-gray-700">Priority support</span>
								</li>
							</ul>

							<Button asChild className="w-full bg-white text-black border-2 border-black hover:bg-gray-50">
								<Link href="/auth/signup">Start Free Trial</Link>
							</Button>
						</div>
					</div>

					<div className="text-center mt-10">
						<Link href="/pricing" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
							View full pricing details
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100">
							FAQ
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Frequently asked questions
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Everything you need to know about FreelancerOS
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						<div>
							<h3 className="text-xl font-semibold text-black mb-3">How does the free trial work?</h3>
							<p className="text-gray-600">
								Our 14-day free trial gives you full access to all Pro plan features. No credit card required, and you can cancel anytime.
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold text-black mb-3">Can I change plans later?</h3>
							<p className="text-gray-600">
								Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades and at the end of your billing cycle for downgrades.
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold text-black mb-3">Is my data secure?</h3>
							<p className="text-gray-600">
								Absolutely. We use bank-level encryption and security practices to ensure your data and your clients' information is always protected.
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold text-black mb-3">Do you offer refunds?</h3>
							<p className="text-gray-600">
								We offer a 30-day money-back guarantee if you're not satisfied with our service for any reason.
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold text-black mb-3">Can I import my existing clients?</h3>
							<p className="text-gray-600">
								Yes, you can easily import your existing clients via CSV or our simple import wizard to get started quickly.
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold text-black mb-3">Is there a limit to how many projects I can manage?</h3>
							<p className="text-gray-600">
								Free plans have some limitations, but our Pro and Business plans offer generous or unlimited project allowances to fit your needs.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-black text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to streamline your freelance business?
					</h2>
					<p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
						Join thousands of freelancers who trust FreelancerOS to manage their business efficiently.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg">
							<Link href="/auth/signup" className="flex items-center gap-2">
								Start Free Trial
								<ArrowRight className="h-5 w-5" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-white/50 hover:text-white px-8 py-6 text-lg">
							<Link href="/auth/signin">Sign In</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="rounded-lg bg-white dark:bg-black p-2 flex-shrink-0">
									<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
								</div>
								<span className="text-xl font-bold text-black">FreelancerOS</span>
							</div>
							<p className="text-gray-600 mb-4">
								The complete operating system for freelancers and independent professionals.
							</p>
							<div className="flex items-center gap-4">
								<a href="#" className="text-gray-500 hover:text-black">
									<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
									</svg>
								</a>
								<a href="#" className="text-gray-500 hover:text-black">
									<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
									</svg>
								</a>
								<a href="#" className="text-gray-500 hover:text-black">
									<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
									</svg>
								</a>
								<a href="#" className="text-gray-500 hover:text-black">
									<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
									</svg>
								</a>
							</div>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Product</h4>
							<ul className="space-y-3">
								<li><Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link></li>
								<li><Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</Link></li>
								<li><Link href="/testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</Link></li>
								<li><Link href="#integrations" className="text-gray-600 hover:text-black transition-colors">Integrations</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Resources</h4>
							<ul className="space-y-3">
								<li><Link href="/blog" className="text-gray-600 hover:text-black transition-colors">Blog</Link></li>
								<li><Link href="#guides" className="text-gray-600 hover:text-black transition-colors">Guides</Link></li>
								<li><Link href="#help" className="text-gray-600 hover:text-black transition-colors">Help Center</Link></li>
								<li><Link href="#api" className="text-gray-600 hover:text-black transition-colors">API Documentation</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Company</h4>
							<ul className="space-y-3">
								<li><Link href="#about" className="text-gray-600 hover:text-black transition-colors">About Us</Link></li>
								<li><Link href="#careers" className="text-gray-600 hover:text-black transition-colors">Careers</Link></li>
								<li><Link href="#privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</Link></li>
								<li><Link href="#terms" className="text-gray-600 hover:text-black transition-colors">Terms of Service</Link></li>
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-200 pt-8 text-center">
						<p className="text-gray-500">© 2025 FreelancerOS. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

'use client';

import Link from 'next/link';
import { BriefcaseBusiness, ArrowRight, Star, Quote, Clock, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestimonialsPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2">
						<div className="rounded-lg bg-white dark:bg-black p-2 flex-shrink-0">
							<BriefcaseBusiness className="h-6 w-6 text-black dark:text-white" />
						</div>
						<span className="text-2xl font-bold text-black">FreelancerOS</span>
					</Link>

					<div className="hidden md:flex items-center gap-8">
						<Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link>
						<Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</Link>
						<Link href="/testimonials" className="text-black font-medium">Testimonials</Link>
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
			<section className="py-20">
				<div className="container mx-auto px-4 text-center">
					<Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
						Testimonials
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
						Loved by
						<span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
							{' '}freelancers{' '}
						</span>
						worldwide
					</h1>
					<p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
						See what other freelancers are saying about how FreelancerOS has transformed their business.
					</p>

					<div className="flex items-center justify-center gap-1 mb-8">
						<Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
						<Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
						<Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
						<Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
						<Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
					</div>
					<p className="text-lg text-gray-700 font-medium">
						4.9 out of 5 stars from over 1,000 reviews
					</p>
				</div>
			</section>

			{/* Featured Testimonials */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-black text-center mb-16">Featured Success Stories</h2>

					<div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<div className="relative">
								<Quote className="absolute -top-2 -left-2 h-8 w-8 text-gray-200 rotate-180" />
								<p className="text-lg text-gray-700 mb-6 pl-6">
									"FreelancerOS has completely transformed how I manage my web design business. The proposal templates alone have increased my conversion rate by 40%! I used to spend hours creating proposals and invoices, but now I can do it in minutes. The client portal has also been a game-changer for my client relationships."
								</p>
							</div>
							<div className="flex items-center gap-4">
								<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
									<span className="text-blue-600 font-bold text-xl">JS</span>
								</div>
								<div>
									<h4 className="font-semibold text-black text-lg">Jessica Smith</h4>
									<p className="text-gray-500">Web Designer</p>
									<p className="text-blue-600 font-medium mt-1">Increased revenue by 35%</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
							<div className="flex items-center gap-1 mb-4">
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
								<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
							</div>
							<div className="relative">
								<Quote className="absolute -top-2 -left-2 h-8 w-8 text-gray-200 rotate-180" />
								<p className="text-lg text-gray-700 mb-6 pl-6">
									"As a freelance developer, I needed a system to keep track of multiple projects. FreelancerOS has been a game-changer for my productivity and client relationships. The time tracking feature ensures I bill accurately, and the analytics help me understand where I'm spending my time and how to optimize it."
								</p>
							</div>
							<div className="flex items-center gap-4">
								<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
									<span className="text-purple-600 font-bold text-xl">AT</span>
								</div>
								<div>
									<h4 className="font-semibold text-black text-lg">Alex Thompson</h4>
									<p className="text-gray-500">Software Developer</p>
									<p className="text-blue-600 font-medium mt-1">Saved 10+ hours per week</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonial Grid */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-black text-center mb-16">What Our Customers Say</h2>

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
								"I've tried many freelance management tools, but FreelancerOS is by far the most comprehensive and user-friendly. It's like it was designed specifically for my workflow."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
									<span className="text-red-600 font-bold">SL</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Sarah Lee</h4>
									<p className="text-gray-500 text-sm">Graphic Designer</p>
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
								"The client portal has elevated my business in the eyes of my clients. They love being able to see project progress and provide feedback in one place."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
									<span className="text-blue-600 font-bold">RB</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Ryan Brown</h4>
									<p className="text-gray-500 text-sm">Content Creator</p>
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
								"I was spending too much time on admin work and not enough on actual client projects. FreelancerOS has completely reversed that ratio for me."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
									<span className="text-yellow-600 font-bold">EW</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Emma Wilson</h4>
									<p className="text-gray-500 text-sm">Copywriter</p>
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
								"The analytics dashboard has given me insights into my business that I never had before. I can now make data-driven decisions about which clients to focus on."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
									<span className="text-indigo-600 font-bold">JD</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">James Davis</h4>
									<p className="text-gray-500 text-sm">SEO Consultant</p>
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
								"I've been able to raise my rates because of the professional image FreelancerOS helps me present to clients. The ROI has been incredible."
							</p>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
									<span className="text-pink-600 font-bold">LM</span>
								</div>
								<div>
									<h4 className="font-semibold text-black">Lisa Martinez</h4>
									<p className="text-gray-500 text-sm">UX Designer</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Case Studies */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
							Case Studies
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Real Results from Real Freelancers
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							See how freelancers like you have transformed their businesses with FreelancerOS.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
								<FileText className="h-16 w-16 text-white" />
							</div>
							<div className="p-6">
								<Badge className="mb-4 bg-blue-100 text-blue-800">Proposals</Badge>
								<h3 className="text-xl font-bold text-black mb-2">40% Higher Conversion Rate</h3>
								<p className="text-gray-600 mb-4">
									How a freelance web developer increased their proposal acceptance rate by 40% using our templates and follow-up system.
								</p>
								<Button asChild variant="outline" className="w-full border-gray-300 text-black hover:bg-gray-50">
									<Link href="#">Read Case Study</Link>
								</Button>
							</div>
						</div>

						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
								<Clock className="h-16 w-16 text-white" />
							</div>
							<div className="p-6">
								<Badge className="mb-4 bg-green-100 text-green-800">Time Tracking</Badge>
								<h3 className="text-xl font-bold text-black mb-2">20 Hours Saved Per Month</h3>
								<p className="text-gray-600 mb-4">
									How a marketing consultant reclaimed 20+ hours per month by automating their time tracking and invoicing process.
								</p>
								<Button asChild variant="outline" className="w-full border-gray-300 text-black hover:bg-gray-50">
									<Link href="#">Read Case Study</Link>
								</Button>
							</div>
						</div>

						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="h-48 bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
								<CreditCard className="h-16 w-16 text-white" />
							</div>
							<div className="p-6">
								<Badge className="mb-4 bg-red-100 text-red-800">Invoicing</Badge>
								<h3 className="text-xl font-bold text-black mb-2">Payments 15 Days Faster</h3>
								<p className="text-gray-600 mb-4">
									How a freelance designer reduced their average payment time from 45 days to just 10 days with our invoicing system.
								</p>
								<Button asChild variant="outline" className="w-full border-gray-300 text-black hover:bg-gray-50">
									<Link href="#">Read Case Study</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Video Testimonials */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
							Video Testimonials
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							Hear Directly From Our Users
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Watch these short videos to see how FreelancerOS has helped freelancers like you.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="aspect-video bg-gray-200 flex items-center justify-center">
								<div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
									<svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z" />
									</svg>
								</div>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-bold text-black mb-2">Sarah's Freelance Journey</h3>
								<p className="text-gray-600">
									"How I went from struggling to find clients to having a waitlist using FreelancerOS."
								</p>
								<div className="flex items-center gap-3 mt-4">
									<div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
										<span className="text-purple-600 font-bold">SJ</span>
									</div>
									<div>
										<h4 className="font-semibold text-black">Sarah Johnson</h4>
										<p className="text-gray-500 text-sm">Content Strategist</p>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="aspect-video bg-gray-200 flex items-center justify-center">
								<div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
									<svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z" />
									</svg>
								</div>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-bold text-black mb-2">From Side Hustle to Full-Time</h3>
								<p className="text-gray-600">
									"How I used FreelancerOS to scale my side hustle into a six-figure freelance business."
								</p>
								<div className="flex items-center gap-3 mt-4">
									<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
										<span className="text-blue-600 font-bold">JT</span>
									</div>
									<div>
										<h4 className="font-semibold text-black">Jason Taylor</h4>
										<p className="text-gray-500 text-sm">Web Developer</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-black text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Join thousands of successful freelancers
					</h2>
					<p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
						Experience the difference FreelancerOS can make for your business with our 14-day free trial.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg">
							<Link href="/auth/signup" className="flex items-center gap-2">
								Start Free Trial
								<ArrowRight className="h-5 w-5" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
							<Link href="/pricing">View Pricing</Link>
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
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Product</h4>
							<ul className="space-y-3">
								<li><Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link></li>
								<li><Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</Link></li>
								<li><Link href="/testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Resources</h4>
							<ul className="space-y-3">
								<li><Link href="/blog" className="text-gray-600 hover:text-black transition-colors">Blog</Link></li>
								<li><Link href="/help" className="text-gray-600 hover:text-black transition-colors">Help Center</Link></li>
								<li><Link href="/guides" className="text-gray-600 hover:text-black transition-colors">Guides</Link></li>
							</ul>
						</div>

						<div>
							<h4 className="text-black font-semibold mb-4">Company</h4>
							<ul className="space-y-3">
								<li><Link href="/about" className="text-gray-600 hover:text-black transition-colors">About Us</Link></li>
								<li><Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</Link></li>
								<li><Link href="/terms" className="text-gray-600 hover:text-black transition-colors">Terms of Service</Link></li>
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

'use client';

import Link from 'next/link';
import { BriefcaseBusiness, ArrowRight, Search, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Sample blog data
const blogPosts = [
	{
		id: 1,
		title: "10 Essential Tools Every Freelancer Needs in 2025",
		excerpt: "Discover the must-have tools that will help you streamline your freelance business and increase productivity.",
		category: "Tools",
		author: "Jessica Smith",
		date: "June 15, 2025",
		readTime: "8 min read",
		image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
		featured: true
	},
	{
		id: 2,
		title: "How to Create Proposals That Win More Clients",
		excerpt: "Learn the psychology behind successful proposals and how to structure yours for maximum impact and conversion.",
		category: "Business",
		author: "Michael Johnson",
		date: "June 10, 2025",
		readTime: "6 min read",
		image: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
		featured: true
	},
	{
		id: 3,
		title: "Time Management Strategies for Freelancers",
		excerpt: "Effective time management techniques to help you balance client work, admin tasks, and personal life.",
		category: "Productivity",
		author: "Alex Thompson",
		date: "June 5, 2025",
		readTime: "5 min read",
		image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
		featured: false
	},
	{
		id: 4,
		title: "Setting Your Freelance Rates: A Comprehensive Guide",
		excerpt: "How to determine your worth, set competitive rates, and confidently communicate your pricing to clients.",
		category: "Finance",
		author: "Sarah Lee",
		date: "May 28, 2025",
		readTime: "10 min read",
		image: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
		featured: false
	},
	{
		id: 5,
		title: "Building a Strong Personal Brand as a Freelancer",
		excerpt: "Strategies to develop a memorable personal brand that attracts your ideal clients and sets you apart from competitors.",
		category: "Marketing",
		author: "David Martinez",
		date: "May 20, 2025",
		readTime: "7 min read",
		image: "https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
		featured: false
	},
	{
		id: 6,
		title: "The Ultimate Guide to Freelance Contracts",
		excerpt: "Everything you need to know about creating solid contracts that protect you and set clear expectations with clients.",
		category: "Legal",
		author: "Emma Wilson",
		date: "May 15, 2025",
		readTime: "9 min read",
		image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
		featured: false
	}
];

// Sample categories
const categories = [
	{ name: "All", count: 24 },
	{ name: "Business", count: 8 },
	{ name: "Productivity", count: 6 },
	{ name: "Tools", count: 5 },
	{ name: "Finance", count: 4 },
	{ name: "Marketing", count: 3 },
	{ name: "Legal", count: 2 }
];

export default function BlogPage() {
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
						<Link href="/testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</Link>
						<Link href="/blog" className="text-black font-medium">Blog</Link>
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
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
							Blog
						</Badge>
						<h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
							Insights for Freelance Success
						</h1>
						<p className="text-xl text-gray-600 mb-8">
							Tips, strategies, and inspiration to help you thrive as a freelancer.
						</p>
						<div className="relative max-w-xl mx-auto">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
							<Input
								placeholder="Search articles..."
								className="pl-10 py-6 text-lg border-gray-300 focus:border-black focus:ring-black"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Posts */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-2xl font-bold text-black mb-8">Featured Articles</h2>

					<div className="grid md:grid-cols-2 gap-8">
						{blogPosts.filter(post => post.featured).map(post => (
							<div key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="aspect-[16/9] relative">
									<img
										src={post.image}
										alt={post.title}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="p-6">
									<div className="flex items-center gap-4 mb-4">
										<Badge className="bg-blue-100 text-blue-800">{post.category}</Badge>
										<div className="flex items-center text-gray-500 text-sm">
											<Clock className="h-4 w-4 mr-1" />
											{post.readTime}
										</div>
									</div>
									<h3 className="text-2xl font-bold text-black mb-3">
										<Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
											{post.title}
										</Link>
									</h3>
									<p className="text-gray-600 mb-4">{post.excerpt}</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 bg-gray-200 rounded-full"></div>
											<span className="text-sm text-gray-700">{post.author}</span>
										</div>
										<div className="flex items-center text-gray-500 text-sm">
											<Calendar className="h-4 w-4 mr-1" />
											{post.date}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* All Posts */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row gap-8">
						{/* Sidebar */}
						<div className="md:w-1/4">
							<div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
								<h3 className="text-lg font-bold text-black mb-4">Categories</h3>
								<ul className="space-y-2">
									{categories.map((category, index) => (
										<li key={index}>
											<Link
												href="#"
												className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors ${category.name === 'All' ? 'bg-gray-100 font-medium' : ''}`}
											>
												<span className="text-gray-800">{category.name}</span>
												<Badge variant="outline" className="text-xs">{category.count}</Badge>
											</Link>
										</li>
									))}
								</ul>

								<div className="mt-8">
									<h3 className="text-lg font-bold text-black mb-4">Popular Tags</h3>
									<div className="flex flex-wrap gap-2">
										<Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Freelancing</Badge>
										<Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Productivity</Badge>
										<Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Clients</Badge>
										<Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Invoicing</Badge>
										<Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Time Management</Badge>
										<Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Proposals</Badge>
									</div>
								</div>

								<div className="mt-8 p-4 bg-black text-white rounded-lg">
									<h3 className="font-bold mb-2">Ready to streamline your freelance business?</h3>
									<p className="text-gray-300 text-sm mb-4">Join thousands of freelancers using FreelancerOS.</p>
									<Button asChild size="sm" className="w-full bg-white text-black hover:bg-gray-100">
										<Link href="/auth/signup">Start Free Trial</Link>
									</Button>
								</div>
							</div>
						</div>

						{/* Main Content */}
						<div className="md:w-3/4">
							<h2 className="text-2xl font-bold text-black mb-8">Latest Articles</h2>

							<div className="grid md:grid-cols-2 gap-8">
								{blogPosts.filter(post => !post.featured).map(post => (
									<div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
										<div className="aspect-[16/9] relative">
											<img
												src={post.image}
												alt={post.title}
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="p-6">
											<div className="flex items-center gap-4 mb-4">
												<Badge className="bg-blue-100 text-blue-800">{post.category}</Badge>
												<div className="flex items-center text-gray-500 text-sm">
													<Clock className="h-4 w-4 mr-1" />
													{post.readTime}
												</div>
											</div>
											<h3 className="text-xl font-bold text-black mb-3">
												<Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
													{post.title}
												</Link>
											</h3>
											<p className="text-gray-600 mb-4">{post.excerpt}</p>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 bg-gray-200 rounded-full"></div>
													<span className="text-sm text-gray-700">{post.author}</span>
												</div>
												<div className="flex items-center text-gray-500 text-sm">
													<Calendar className="h-4 w-4 mr-1" />
													{post.date}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="mt-12 text-center">
								<Button variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
									Load More Articles
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto bg-black text-white rounded-2xl p-12 text-center">
						<h2 className="text-3xl font-bold mb-4">Subscribe to our newsletter</h2>
						<p className="text-gray-300 mb-8">
							Get the latest freelancing tips, tools, and resources delivered straight to your inbox.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
							<Input
								placeholder="Enter your email"
								className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white focus:ring-white"
							/>
							<Button className="bg-white text-black hover:bg-gray-100">
								Subscribe
							</Button>
						</div>
						<p className="text-gray-400 text-sm mt-4">
							We respect your privacy. Unsubscribe at any time.
						</p>
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

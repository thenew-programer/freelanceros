'use client';

import Link from 'next/link';
import { BriefcaseBusiness, ArrowRight, Users, Clock, FileText, BarChart3, CreditCard, Globe, Shield, Zap, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FeaturesPage() {
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
						<Link href="/features" className="text-black font-medium">Features</Link>
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
			<section className="py-20">
				<div className="container mx-auto px-4 text-center">
					<Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
						Features
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
						Everything you need to run your
						<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							{' '}freelance business
						</span>
					</h1>
					<p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
						FreelancerOS combines all the tools you need into one seamless platform,
						saving you time and helping you look professional.
					</p>
				</div>
			</section>

			{/* Feature Sections */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					{/* Proposals Feature */}
					<div className="grid md:grid-cols-2 gap-12 items-center mb-24">
						<div>
							<div className="inline-block rounded-lg bg-blue-100 p-3 mb-6">
								<FileText className="h-6 w-6 text-blue-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Smart Proposals</h2>
							<p className="text-xl text-gray-600 mb-6">
								Create professional proposals that win clients with our customizable templates and automated workflows.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Customizable Templates</h3>
										<p className="text-gray-600">Choose from a variety of professional templates or create your own to match your brand.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Electronic Signatures</h3>
										<p className="text-gray-600">Get proposals signed faster with built-in electronic signature capabilities.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Automatic Follow-ups</h3>
										<p className="text-gray-600">Schedule automatic follow-up emails to increase your proposal acceptance rate.</p>
									</div>
								</li>
							</ul>
							<Button asChild className="bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">
									Try It Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
						<div className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<h3 className="text-xl font-bold text-black mb-4">Website Redesign Proposal</h3>
								<div className="space-y-4">
									<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									<div className="h-4 bg-gray-200 rounded"></div>
									<div className="h-4 bg-gray-200 rounded"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
								<div className="mt-6 pt-6 border-t border-gray-200">
									<div className="flex justify-between items-center">
										<div className="text-sm text-gray-500">Total Amount</div>
										<div className="text-xl font-bold text-black">$5,000.00</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Project Management Feature */}
					<div className="grid md:grid-cols-2 gap-12 items-center mb-24">
						<div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<h3 className="text-xl font-bold text-black mb-4">Project Timeline</h3>
								<div className="space-y-6">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
											<CheckCircle className="h-4 w-4 text-green-600" />
										</div>
										<div className="flex-1">
											<div className="text-sm font-medium text-black">Project Kickoff</div>
											<div className="h-1 bg-green-500 rounded-full mt-1"></div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
											<Clock className="h-4 w-4 text-yellow-600" />
										</div>
										<div className="flex-1">
											<div className="text-sm font-medium text-black">Design Phase</div>
											<div className="h-1 bg-yellow-500 rounded-full mt-1 w-3/4"></div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
											<Clock className="h-4 w-4 text-gray-400" />
										</div>
										<div className="flex-1">
											<div className="text-sm font-medium text-black">Development</div>
											<div className="h-1 bg-gray-200 rounded-full mt-1"></div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
											<Clock className="h-4 w-4 text-gray-400" />
										</div>
										<div className="flex-1">
											<div className="text-sm font-medium text-black">Testing & Launch</div>
											<div className="h-1 bg-gray-200 rounded-full mt-1"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="order-1 md:order-2">
							<div className="inline-block rounded-lg bg-green-100 p-3 mb-6">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Project Management</h2>
							<p className="text-xl text-gray-600 mb-6">
								Track milestones, deadlines, and deliverables with client portals that keep everyone on the same page.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Milestone Tracking</h3>
										<p className="text-gray-600">Break projects into manageable milestones with clear deadlines and deliverables.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Client Collaboration</h3>
										<p className="text-gray-600">Share progress updates and collect feedback directly through the platform.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">File Sharing</h3>
										<p className="text-gray-600">Securely share files and documents with clients and team members.</p>
									</div>
								</li>
							</ul>
							<Button asChild className="bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">
									Try It Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>

					{/* Time Tracking Feature */}
					<div className="grid md:grid-cols-2 gap-12 items-center mb-24">
						<div>
							<div className="inline-block rounded-lg bg-yellow-100 p-3 mb-6">
								<Clock className="h-6 w-6 text-yellow-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Time Tracking</h2>
							<p className="text-xl text-gray-600 mb-6">
								Log hours automatically and generate detailed time reports to maximize your billable hours.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">One-Click Timer</h3>
										<p className="text-gray-600">Start and stop time tracking with a single click, no matter what you're working on.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Automatic Invoicing</h3>
										<p className="text-gray-600">Convert tracked time into invoices with a single click, ensuring you bill for all your work.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Detailed Reports</h3>
										<p className="text-gray-600">Analyze how you spend your time with detailed reports and visualizations.</p>
									</div>
								</li>
							</ul>
							<Button asChild className="bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">
									Try It Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
						<div className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-xl font-bold text-black">Time Tracker</h3>
									<div className="text-3xl font-mono font-bold text-black">02:45:18</div>
								</div>
								<div className="space-y-4 mb-6">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Project:</span>
										<span className="font-medium text-black">Website Redesign</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Task:</span>
										<span className="font-medium text-black">Homepage Development</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Started:</span>
										<span className="font-medium text-black">10:15 AM</span>
									</div>
								</div>
								<Button className="w-full bg-red-600 hover:bg-red-700 text-white">Stop Timer</Button>
							</div>
						</div>
					</div>

					{/* Invoicing Feature */}
					<div className="grid md:grid-cols-2 gap-12 items-center mb-24">
						<div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-xl font-bold text-black">Invoice #INV-2025</h3>
									<Badge className="bg-green-100 text-green-800">Paid</Badge>
								</div>
								<div className="space-y-4 mb-6">
									<div className="flex justify-between">
										<span className="text-gray-600">Client:</span>
										<span className="font-medium text-black">Acme Corporation</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Amount:</span>
										<span className="font-medium text-black">$3,500.00</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Due Date:</span>
										<span className="font-medium text-black">July 15, 2025</span>
									</div>
								</div>
								<div className="pt-4 border-t border-gray-200">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Status:</span>
										<span className="text-green-600 font-medium">Paid on July 10, 2025</span>
									</div>
								</div>
							</div>
						</div>
						<div className="order-1 md:order-2">
							<div className="inline-block rounded-lg bg-purple-100 p-3 mb-6">
								<CreditCard className="h-6 w-6 text-purple-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Professional Invoicing</h2>
							<p className="text-xl text-gray-600 mb-6">
								Create beautiful, customizable invoices that get you paid faster with online payment options.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Custom Branding</h3>
										<p className="text-gray-600">Add your logo, colors, and fonts to create professional, branded invoices.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Recurring Invoices</h3>
										<p className="text-gray-600">Set up automatic recurring invoices for retainer clients and subscriptions.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Payment Reminders</h3>
										<p className="text-gray-600">Send automatic reminders for upcoming and overdue invoices.</p>
									</div>
								</li>
							</ul>
							<Button asChild className="bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">
									Try It Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>

					{/* Client Portal Feature */}
					<div className="grid md:grid-cols-2 gap-12 items-center mb-24">
						<div>
							<div className="inline-block rounded-lg bg-indigo-100 p-3 mb-6">
								<Globe className="h-6 w-6 text-indigo-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Client Portal</h2>
							<p className="text-xl text-gray-600 mb-6">
								Give clients a professional, branded experience with secure access to projects and files.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Secure Sharing</h3>
										<p className="text-gray-600">Share files, documents, and project updates securely with your clients.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Progress Tracking</h3>
										<p className="text-gray-600">Let clients see real-time project progress and milestone completions.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Feedback Collection</h3>
										<p className="text-gray-600">Collect structured feedback and approvals directly through the portal.</p>
									</div>
								</li>
							</ul>
							<Button asChild className="bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">
									Try It Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
						<div className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
										<FileText className="h-5 w-5 text-white" />
									</div>
									<div>
										<h3 className="text-lg font-bold text-black">Client Portal</h3>
										<p className="text-sm text-gray-500">Project Dashboard</p>
									</div>
								</div>
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Progress</span>
										<span className="font-medium text-black">75%</span>
									</div>
									<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
										<div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
									</div>
									<div className="pt-4 space-y-3">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-gray-700">Project Kickoff</span>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-500" />
											<span className="text-gray-700">Design Phase</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-yellow-500" />
											<span className="text-gray-700">Development</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-gray-400" />
											<span className="text-gray-400">Testing & Launch</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Analytics Feature */}
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<h3 className="text-xl font-bold text-black mb-4">Revenue Overview</h3>
								<div className="h-40 flex items-end gap-2">
									<div className="h-[30%] w-8 bg-blue-200 rounded-t-md"></div>
									<div className="h-[45%] w-8 bg-blue-300 rounded-t-md"></div>
									<div className="h-[60%] w-8 bg-blue-400 rounded-t-md"></div>
									<div className="h-[40%] w-8 bg-blue-300 rounded-t-md"></div>
									<div className="h-[70%] w-8 bg-blue-500 rounded-t-md"></div>
									<div className="h-[90%] w-8 bg-blue-600 rounded-t-md"></div>
									<div className="h-[75%] w-8 bg-blue-500 rounded-t-md"></div>
									<div className="h-[85%] w-8 bg-blue-600 rounded-t-md"></div>
									<div className="h-[100%] w-8 bg-blue-700 rounded-t-md"></div>
									<div className="h-[80%] w-8 bg-blue-500 rounded-t-md"></div>
									<div className="h-[95%] w-8 bg-blue-600 rounded-t-md"></div>
									<div className="h-[85%] w-8 bg-blue-600 rounded-t-md"></div>
								</div>
								<div className="flex justify-between text-xs text-gray-500 mt-2">
									<span>Jan</span>
									<span>Feb</span>
									<span>Mar</span>
									<span>Apr</span>
									<span>May</span>
									<span>Jun</span>
									<span>Jul</span>
									<span>Aug</span>
									<span>Sep</span>
									<span>Oct</span>
									<span>Nov</span>
									<span>Dec</span>
								</div>
								<div className="mt-6 pt-4 border-t border-gray-200">
									<div className="grid grid-cols-3 gap-4 text-center">
										<div>
											<div className="text-2xl font-bold text-black">$86.4k</div>
											<div className="text-xs text-gray-500">Total Revenue</div>
										</div>
										<div>
											<div className="text-2xl font-bold text-green-600">+24%</div>
											<div className="text-xs text-gray-500">Year Growth</div>
										</div>
										<div>
											<div className="text-2xl font-bold text-black">$7.2k</div>
											<div className="text-xs text-gray-500">Avg. Monthly</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="order-1 md:order-2">
							<div className="inline-block rounded-lg bg-red-100 p-3 mb-6">
								<BarChart3 className="h-6 w-6 text-red-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Business Analytics</h2>
							<p className="text-xl text-gray-600 mb-6">
								Gain insights into your business performance and growth with detailed analytics dashboards.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Income Forecasting</h3>
										<p className="text-gray-600">Predict future income based on your pipeline and historical data.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Client Insights</h3>
										<p className="text-gray-600">Identify your most valuable clients and opportunities for growth.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Productivity Metrics</h3>
										<p className="text-gray-600">Track your billable hours, utilization rate, and productivity trends.</p>
									</div>
								</li>
							</ul>
							<Button asChild className="bg-black text-white hover:bg-gray-800">
								<Link href="/auth/signup">
									Try It Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Mobile App Section */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
							Mobile App
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
							FreelancerOS on the go
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Manage your freelance business from anywhere with our powerful mobile app.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="rounded-lg bg-blue-100 p-3 w-fit mb-6">
								<Clock className="h-6 w-6 text-blue-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Track Time Anywhere</h3>
							<p className="text-gray-600">
								Start and stop your timer from anywhere, ensuring you capture all billable hours even when you're away from your desk.
							</p>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="rounded-lg bg-green-100 p-3 w-fit mb-6">
								<Smartphone className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Manage On The Go</h3>
							<p className="text-gray-600">
								Review proposals, check project status, and respond to client messages from your mobile device.
							</p>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
							<div className="rounded-lg bg-purple-100 p-3 w-fit mb-6">
								<CreditCard className="h-6 w-6 text-purple-600" />
							</div>
							<h3 className="text-xl font-semibold text-black mb-3">Send Invoices Instantly</h3>
							<p className="text-gray-600">
								Create and send professional invoices directly from your phone as soon as a project is complete.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Security Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<div className="inline-block rounded-lg bg-green-100 p-3 mb-6">
								<Shield className="h-6 w-6 text-green-600" />
							</div>
							<h2 className="text-3xl font-bold text-black mb-4">Enterprise-Grade Security</h2>
							<p className="text-xl text-gray-600 mb-6">
								Your data and your clients' information are protected with bank-level security measures.
							</p>
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">End-to-End Encryption</h3>
										<p className="text-gray-600">All data is encrypted in transit and at rest using industry-standard protocols.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">Regular Security Audits</h3>
										<p className="text-gray-600">Our systems undergo regular security audits and penetration testing.</p>
									</div>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h3 className="font-semibold text-black">GDPR Compliant</h3>
										<p className="text-gray-600">We're fully compliant with GDPR and other privacy regulations worldwide.</p>
									</div>
								</li>
							</ul>
						</div>
						<div className="bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center">
							<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
								<div className="flex items-center justify-center mb-6">
									<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
										<Shield className="h-12 w-12 text-green-600" />
									</div>
								</div>
								<div className="text-center">
									<h3 className="text-xl font-bold text-black mb-2">Your Data is Protected</h3>
									<p className="text-gray-600 mb-4">
										We use industry-leading security practices to keep your data safe and secure.
									</p>
									<div className="flex items-center justify-center gap-4">
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
											<svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
											</svg>
										</div>
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
											<svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
												<path d="M7 11V7a5 5 0 0 1 10 0v4" />
											</svg>
										</div>
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
											<svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
												<path d="M9 12l2 2 4-4" />
											</svg>
										</div>
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
						<Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
							<Link href="/pricing">View Pricing</Link>
						</Button>
					</div>
					<p className="mt-6 text-gray-400 flex items-center justify-center gap-2">
						<Shield className="h-4 w-4" />
						No credit card required for free trial
					</p>
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

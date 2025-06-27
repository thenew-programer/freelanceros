'use client';

import Link from 'next/link';
import { Briefcase, ArrowRight, Users, Clock, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-black p-2">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">FreelancerOS</span>
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

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-6">
            The Complete
            <span className="text-black">
              {' '}Freelancer{' '}
            </span>
            Operating System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage proposals, track projects, log time, and grow your freelance business 
            with our comprehensive platform built specifically for independent professionals.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
              <Link href="/auth/signup" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-300 text-black hover:bg-gray-50">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-gray-100 p-3 w-fit mb-4">
              <FileText className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Smart Proposals</h3>
            <p className="text-gray-600">Create professional proposals with templates and automated workflows.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-gray-100 p-3 w-fit mb-4">
              <Users className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Project Management</h3>
            <p className="text-gray-600">Track milestones, deadlines, and deliverables with client portals.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-gray-100 p-3 w-fit mb-4">
              <Clock className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Time Tracking</h3>
            <p className="text-gray-600">Log hours automatically and generate detailed time reports.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-gray-100 p-3 w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Analytics</h3>
            <p className="text-gray-600">Gain insights into your business performance and growth.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center rounded-2xl bg-black p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your freelance business?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of freelancers who trust FreelancerOS to manage their business.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-black hover:bg-gray-100">
            <Link href="/auth/signup" className="flex items-center gap-2">
              Get Started Today
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>© 2025 FreelancerOS. Built for professional freelancers.</p>
        </div>
      </div>
    </div>
  );
}
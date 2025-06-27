'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {
  return (
    <AuthLayout
      title="Authentication Error"
      subtitle="There was a problem with your authentication link"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <p className="mb-6 text-gray-600">
          The authentication link you used is invalid or has expired. Please try signing in again.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-gray-300 text-black hover:bg-gray-50">
            <Link href="/auth/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
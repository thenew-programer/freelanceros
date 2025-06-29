import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Auth routes that don't require authentication
	const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
	const isPublicRoute = req.nextUrl.pathname === '/' ||
		req.nextUrl.pathname === '/pricing' ||
		req.nextUrl.pathname.startsWith('/portal') ||
		req.nextUrl.pathname === '/features' ||
		req.nextUrl.pathname === '/testimonials' ||
		req.nextUrl.pathname === '/blog' ||
		req.nextUrl.pathname.startsWith('/blog/');

	// Redirect to dashboard if accessing root path while authenticated
	if (session && req.nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	// Redirect to login if accessing protected route without authentication
	if (!session && !isAuthRoute && !isPublicRoute) {
		const redirectUrl = new URL('/auth/signin', req.url);
		redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// Redirect to dashboard if accessing auth routes while authenticated
	if (session && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	// For authenticated users, check subscription status for premium routes

	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - api routes that handle their own authentication
		 */
		'/((?!_next/static|_next/image|public|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$|api/webhooks).*)',
	],
};

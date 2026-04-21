import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if a Supabase session cookie exists (any cookie with 'auth-token' or 'sb-' prefix)
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(c => c.name.includes('auth-token') || (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')))

  // Protect dashboard - redirect to login if no session
  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (hasSession && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/register'],
}
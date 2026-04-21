import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookies = request.cookies.getAll()
  
  // Supabase setzt Cookies mit 'sb-' prefix
  const hasSession = cookies.some(c => 
    c.name.startsWith('sb-') || 
    c.name.includes('supabase') ||
    c.name.includes('auth-token')
  )

  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (hasSession && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/register'],
}

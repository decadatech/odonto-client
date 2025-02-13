import { MiddlewareConfig, NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES: Array<{ path: string, whenAuthenticatedAction: 'redirect' | 'next' }> = [
  { path: '/sign-in', whenAuthenticatedAction: 'redirect' }
]
const PUBLIC_ROUTE_REDIRECT = '/sign-in'
const PRIVATE_ROUTE_REDIRECT = '/'
const AUTH_TOKEN_NAME = '__auth_token'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const publicRoute = PUBLIC_ROUTES.find(route => route.path === path)
  const authToken = req.cookies.get(AUTH_TOKEN_NAME)

  if (!authToken && publicRoute) {
    return NextResponse.next()
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = PUBLIC_ROUTE_REDIRECT

    return NextResponse.redirect(redirectUrl)
  }

  if (authToken && publicRoute && publicRoute.whenAuthenticatedAction === 'redirect') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = PRIVATE_ROUTE_REDIRECT

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
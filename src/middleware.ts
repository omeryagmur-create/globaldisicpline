import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // Update session first
    const response = await updateSession(request)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Public/Auth routes
    if (path === '/login' || path === '/signup' || path === '/reset-password') {
        if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Protected routes
    const protectedPaths = [
        '/dashboard',
        '/focus',
        '/leaderboard',
        '/planner',
        '/mock-analysis',
        '/community',
        '/profile',
        '/premium',
        '/admin'
    ]

    const isProtectedPath = protectedPaths.some((p) => path.startsWith(p))

    if (isProtectedPath && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin route check
    if (path.startsWith('/admin')) {
        if (user) {
            // Check if user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            if (!profile?.is_admin) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

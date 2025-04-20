import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// membuat daftar rute publik dan rute yang dilindungi
const publicRoutes = ['/auth', '/api'];
const protectedRoutes = ['/admin', '/reviewer', '/settings', "/forbidden", '/auth/change-password', '/dashboard', '/dashboadr', '/'];

// Rute khusus autentikasi (login, register) yang hanya bisa diakses user yang belum login
const authRoutes = [
  '/auth/login',
  '/auth/register',
]

export async function middleware(request: NextRequest) {
  try {
    // Create a response early that we can modify
    let response = NextResponse.next();

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if it exists
    const { data: { session } } = await supabase.auth.getSession()

    // Mendapatkan URL dan jalur dari permintaan
    const path = request.nextUrl.pathname;

    // Jika pengguna mengakses halaman utama (root path) dan sudah login,
    // arahkan ke dashboard sesuai role mereka
    if (path === '/' && session?.user) {
      // Ambil role pengguna dari database
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      // Redirect berdasarkan role
      if (userData?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (userData?.role === 'reviewer') {
        return NextResponse.redirect(new URL('/reviewer', request.url));
      } else {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    // Jika tidak ada user dan mencoba mengakses halaman yang dilindungi
    if (!session?.user && protectedRoutes.some(route => path.startsWith(route))) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Jika ada user tapi mencoba mengakses halaman login/register
    if (session?.user && authRoutes.some(route => path.startsWith(route))) {
      // Ambil role pengguna dari database
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      // Redirect berdasarkan role
      if (userData?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (userData?.role === 'reviewer') {
        return NextResponse.redirect(new URL('/reviewer', request.url));
      } else {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    // Memeriksa apakah jalur adalah rute publik (auth, api)
    if (publicRoutes.some((route) => path.startsWith(route))) {
      return response;
    }

    // Jika jalur adalah rute yang dilindungi dan user terautentikasi
    if (protectedRoutes.some((route) => path.startsWith(route)) && session?.user) {
      // Ambil peran pengguna dari tabel 'users'
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Set custom headers
      response.headers.set('pkm-user-role', userData?.role || '');
      response.headers.set('pkm-user-id', session.user.id);

      // Cek untuk dashboard dan alihkan berdasarkan role
      if (path === '/dashboard' || path === '/dashboadr') {
        if (userData?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (userData?.role === 'reviewer') {
          return NextResponse.redirect(new URL('/reviewer', request.url));
        } else {
          return NextResponse.redirect(new URL('/forbidden', request.url));
        }
      }

      // Cek akses ke rute admin
      if (path.startsWith('/admin') && userData?.role !== 'admin') {
        const redirectResponse = NextResponse.redirect(new URL('/forbidden', request.url));
        redirectResponse.headers.set('pkm-user-role', userData?.role || '');
        return redirectResponse;
      }
      
      // Cek akses ke rute reviewer
      if (path.startsWith('/reviewer') && userData?.role !== 'reviewer') {
        const redirectResponse = NextResponse.redirect(new URL('/forbidden', request.url));
        redirectResponse.headers.set('pkm-user-role', userData?.role || '');
        return redirectResponse;
      }
    }

    return response;
  } catch (error) {
    // Log error untuk debugging
    console.error('Middleware error:', error);
    
    // Return a basic response in case of error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
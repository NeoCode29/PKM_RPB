import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { supabaseServer } from '@/lib/supabase/server'

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
    const { user, response } = await updateSession(request)
    
    // Mendapatkan URL dan jalur dari permintaan
    const path = request.nextUrl.pathname;

    // Memeriksa apakah jalur adalah rute publik (auth, api)
    if (publicRoutes.some((route) => path.startsWith(route))) {
      return response;
    }

    // Jika pengguna mengakses halaman utama (root path) dan sudah login,
    // arahkan ke dashboard sesuai role mereka
    if (path === '/' && user) {
      try {
        const supabase = await supabaseServer();
        // Ambil role pengguna dari database
        const {data} = await supabase.from('users').select('role,id').eq('id', user.id).single();
        
        // Redirect berdasarkan role
        if (data?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (data?.role === 'reviewer') {
          return NextResponse.redirect(new URL('/reviewer', request.url));
        } else {
          return NextResponse.redirect(new URL('/forbidden', request.url));
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        return response;
      }
    }

    // Jika tidak ada user dan mencoba mengakses halaman yang dilindungi
    if (!user && (
      path.startsWith('/admin') ||
      path.startsWith('/reviewer') ||
      path.startsWith('/settings') ||
      path === '/dashboard' ||
      path === '/dashboadr'
    )) {
      // Simpan halaman yang dicoba akses untuk redirect kembali setelah login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Jika ada user tapi mencoba mengakses halaman login/register
    if (user && authRoutes.some(route => path.startsWith(route))) {
      try {
        const supabase = await supabaseServer();
        // Ambil role pengguna dari database
        const {data} = await supabase.from('users').select('role,id').eq('id', user.id).single();
        
        // Redirect berdasarkan role
        if (data?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (data?.role === 'reviewer') {
          return NextResponse.redirect(new URL('/reviewer', request.url));
        } else {
          return NextResponse.redirect(new URL('/forbidden', request.url));
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        return response;
      }
    }

    // Jika jalur adalah rute yang dilindungi, periksa apakah pengguna sudah terautentikasi
    if (protectedRoutes.some((route) => path.startsWith(route))) {
      // Jika pengguna tidak terautentikasi, arahkan ke halaman login
      if (!user) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
      }

      try {
        const supabase = await supabaseServer();
        // Jika pengguna terautentikasi, ambil peran pengguna dari tabel 'users'
        const {data} = await supabase.from('users').select('role,id').eq('id', user.id).single();

        const newResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        
        newResponse.headers.set('pkm-user-role', data?.role || '');
        newResponse.headers.set('pkm-user-id', data?.id || '');

        // Cek untuk dashboard (baik dengan ejaan yang benar maupun typo) dan alihkan berdasarkan role
        if (path === '/dashboard' || path === '/dashboadr') {
          if (data?.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          } else if (data?.role === 'reviewer') {
            return NextResponse.redirect(new URL('/reviewer', request.url));
          } else {
            return NextResponse.redirect(new URL('/forbidden', request.url));
          }
        }

        if(path.startsWith('/admin') && data?.role !== 'admin'){
          let redirectResponse = NextResponse.redirect(new URL('/forbidden', request.url));
          redirectResponse.headers.set('pkm-user-role', data?.role || '');
          return redirectResponse;
        }
        
        if(path.startsWith('/reviewer') && data?.role !== 'reviewer'){
          let redirectResponse = NextResponse.redirect(new URL('/forbidden', request.url));
          redirectResponse.headers.set('pkm-user-role', data?.role || '');
          return redirectResponse;
        }

        return newResponse;
      } catch (error) {
        console.error('Error in protected route handling:', error);
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a basic response to prevent the middleware from failing completely
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
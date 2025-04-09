import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { supabaseServer } from './lib/supabase/server';

// membuat daftar rute publik dan rute yang dilindungi
const publicRoutes = ['/auth', '/api'];
const protectedRoutes = ['/admin', '/reviewer', '/settings', "/forbidden"];

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const supabase = await supabaseServer();

  // Jika tidak ada user dan mencoba mengakses halaman admin
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Jika ada user tapi mencoba mengakses halaman login
  if (user && request.nextUrl.pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Mendapatkan URL dan jalur dari permintaan
  const path = request.nextUrl.pathname;

  // Memeriksa apakah jalur adalah rute publik atau rute yang dilindungi
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return response;
  }

  // Jika jalur adalah rute yang dilindungi, periksa apakah pengguna sudah terautentikasi
  if (protectedRoutes.some((route) => path.startsWith(route))) {

    // Jika pengguna tidak terautentikasi, arahkan ke halaman login
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Jika pengguna terautentikasi, ambil peran pengguna dari tabel 'users'
    const {data} = await supabase.from('users').select('role,id').eq('id', user.id).single();

    response.headers.set('pkm-user-role', data?.role );
    response.headers.set('pkm-user-id', data?.id );

    if(path.startsWith('/admin') && data?.role !== 'admin'){
      let response = NextResponse.redirect(new URL('/forbidden', request.url))
      response.headers.set('pkm-user-role', data?.role );
      return response;
    }
    
    if(path.startsWith('/reviewer') && data?.role !== 'reviewer'){
      let response = NextResponse.redirect(new URL('/forbidden', request.url))
      response.headers.set('pkm-user-role', data?.role );
      return response;
    }
  }

  return response;
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { supabaseServer } from './lib/supabase/server';

// membuat daftar rute publik dan rute yang dilindungi
const publicRoutes = ['/auth', '/api'];
const protectedRoutes = ['/admin', '/reviewer', '/settings', "/forbidden", '/auth/change-password', '/dashboard', '/dashboadr', '/'];

// Rute khusus autentikasi (login, register) yang hanya bisa diakses user yang belum login
const authRoutes = [
  '/auth/login',
  '/auth/register',
]

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const supabase = await supabaseServer();

  // Mendapatkan URL dan jalur dari permintaan
  const path = request.nextUrl.pathname;

  // Jika pengguna mengakses halaman utama (root path) dan sudah login,
  // arahkan ke dashboard sesuai role mereka
  if (path === '/' && user) {
    
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
  }

  // Jika tidak ada user dan mencoba mengakses halaman yang dilindungi
  if (!user && (
    path.startsWith('/admin') ||
    path.startsWith('/reviewer') ||
    path.startsWith('/settings') ||
    path === '/dashboard' ||
    path === '/dashboadr'
  )) {
   
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Jika ada user tapi mencoba mengakses halaman login/register
  if (user && authRoutes.some(route => path.startsWith(route))) {
    
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
  }

  // Memeriksa apakah jalur adalah rute publik (auth, api)
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return response;
  }

  // Jika jalur adalah rute yang dilindungi, periksa apakah pengguna sudah terautentikasi
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    // Jika pengguna tidak terautentikasi, arahkan ke halaman login
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Jika pengguna terautentikasi, ambil peran pengguna dari tabel 'users'
    const {data} = await supabase.from('users').select('role,id').eq('id', user.id).single();

    response.headers.set('pkm-user-role', data?.role);
    response.headers.set('pkm-user-id', data?.id);

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
      redirectResponse.headers.set('pkm-user-role', data?.role);
      return redirectResponse;
    }
    
    if(path.startsWith('/reviewer') && data?.role !== 'reviewer'){
      let redirectResponse = NextResponse.redirect(new URL('/forbidden', request.url));
      redirectResponse.headers.set('pkm-user-role', data?.role);
      return redirectResponse;
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
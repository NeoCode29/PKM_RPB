// File: app/auth/confirm/route.ts
import { supabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mendapatkan token konfirmasi dan token redirect dari query parameters
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/auth/login';

  // Validasi parameter
  if (!token_hash || !type) {
    return NextResponse.redirect(new URL(`/auth/error?error=Missing parameters`, request.url));
  }

  // Inisialisasi Supabase client
  const supabase = await supabaseServer();

  // Verifikasi token konfirmasi email
  if (type === 'email') {
    const { error } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash,
    });
    
    if (error) {
      console.error('Verification error:', error);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }


    // Redirect ke halaman yang sudah ditentukan dengan pesan sukses
    return NextResponse.redirect(
      new URL(`${next}?message=Email verified successfully`, request.url)
    );
  }

  // Jika type tidak dikenali
  return NextResponse.redirect(
    new URL(`/auth/error?error=Invalid verification type`, request.url)
  );
}
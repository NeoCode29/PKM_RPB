'use server';

import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Skema validasi untuk registrasi
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username harus minimal 3 karakter' }),
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password harus minimal 6 karakter' }),
});

// Tipe data hasil registrasi
type RegisterResult = {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
};

/**
 * Server action untuk registrasi pengguna baru
 * @param data Data registrasi (username, email, password)
 * @returns Object yang menunjukkan keberhasilan atau kegagalan dengan pesan error
 */
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    // Validasi data menggunakan Zod
    const validatedData = registerSchema.parse(data);
    
    // Inisialisasi Supabase client
    const supabase = await supabaseServer()

    // Set konfigurasi redirect URL untuk konfirmasi email
    // Pastikan URL ini sudah diatur di Supabase Auth Settings
    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/confirm`;

    // Mendaftarkan pengguna di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          username: validatedData.username,
        },
        emailRedirectTo: redirectTo,
      },
    }, // Tambahkan redirectTo di sini
  );

    // Jika terjadi error pada registrasi auth
    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return {
        success: false,
        error: authError.message,
      };
    }

    // Cek apakah perlu konfirmasi email
    const needsEmailConfirmation = !authData.user?.email_confirmed_at;

    // Jika berhasil, tambahkan data ke tabel users
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user?.id,
      username: validatedData.username,
      email: validatedData.email,
      role: 'reviewer',
      created_at: new Date().toISOString(),
    });

    // Jika terjadi error pada insert data
    if (dbError) {
      console.error('Supabase DB Error:', dbError);
      
      // Jika gagal, hapus user yang sudah diregistrasi di auth
      // (Opsional: Anda bisa skip langkah ini jika menggunakan RLS atau triggers)
      await supabase.auth.admin.deleteUser(authData.user?.id!);
      
      return {
        success: false,
        error: dbError.message,
      };
    }

    // Registrasi berhasil
    return {
      success: true,
      needsEmailConfirmation,
    };
  } catch (error) {
    // Error validasi atau error lainnya
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', '),
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi',
    };
  }
}

/**
 * Server action untuk menangani form submit langsung
 * @param formData FormData dari form submission
 */
export async function registerUserFromForm(formData: FormData) {
  try {
    // Ekstrak data dari FormData
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Panggil fungsi registerUser
    const result = await registerUser({ username, email, password });

    if (result.success) {
      // Redirect ke halaman login jika berhasil
      redirect('/login');
    } else {
      // Throw error jika gagal untuk ditangkap di client
      throw new Error(result.error);
    }
  } catch (error) {
    // Lempar kembali error untuk ditangkap di client
    throw error;
  }
}
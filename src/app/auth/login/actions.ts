'use server';

import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { resendConfirmationEmail } from '../verify-email/actions';

// membuat skema validasi login
const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password harus minimal 6 karakter' }),
});

// membuat tipe data hasil login
type LoginResult = {
    success: boolean;
    error?: string;
    needsEmailConfirmation?: boolean;
    nextLink?: string;
}

// membuat tipe data parameter login
type LoginParams = {
    email: string;
    password: string;
}

// membuat fungsi untuk login
export async function loginUser(data: LoginParams): Promise<LoginResult> {
    try {
        // validasi data menggunakan Zod
        const validatedData = loginSchema.parse(data);

        // inisialisasi Supabase client
        const supabase = await supabaseServer();

        // login menggunakan Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: validatedData.email,
            password: validatedData.password,
        });

        // jika login gagal
        if (authError) {
            console.error('Supabase Auth Error:', authError);
            
            // Periksa apakah error terkait email yang belum terverifikasi
            if (authError.message.includes('Email not confirmed') || 
                authError.message.includes('Email hasn\'t been confirmed')) {
                // Kirim ulang email konfirmasi
                await resendConfirmationEmail(validatedData.email);
                return {
                    success: false,
                    error: 'Email Anda belum dikonfirmasi. Kami telah mengirim ulang email konfirmasi.',
                    needsEmailConfirmation: true,
                };
            }
            
            return {
                success: false,
                error: authError.message,
            };
        }

        // Pastikan user ada sebelum melanjutkan
        if (!authData?.user) {
            return {
                success: false,
                error: 'Tidak dapat mengambil data pengguna',
            };
        }

        // jika email belum terverifikasi
        if (authData.user.email_confirmed_at === null) {
            // Kirim ulang email konfirmasi
            await resendConfirmationEmail(validatedData.email);
            return {
                success: false,
                error: 'Email Anda belum dikonfirmasi. Kami telah mengirim ulang email konfirmasi.',
                needsEmailConfirmation: true,
            };
        }

        // mendapatkan role pengguna dari tabel 'users'
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        if (userError) {
            console.error('User Data Error:', userError);
            return {
                success: false,
                error: 'Gagal mengambil data pengguna',
            };
        }

        // Middleware akan menangani pengalihan sesuai peran, jadi kita hanya perlu mengembalikan satu URL
        // Pengalihan akan dilakukan oleh middleware untuk membawa pengguna ke halaman yang sesuai
        console.log('Login successful for user with role:', userData?.role);
        
        return {
            success: true,
            nextLink: '/'  // Middleware akan mengarahkan ke halaman yang sesuai berdasarkan role
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation Error:', error.errors);
            return {
                success: false,
                error: error.errors.map(e => e.message).join(', '),
            };
        } else {
            console.error('Unexpected Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
            };
        }
    }
}


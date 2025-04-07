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
        //validasi data menggunakan Zod
        const validatedData = loginSchema.parse(data);

        // inisialisasi Supabase client
        const supabase = await supabaseServer();

        // login menggunakan Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: validatedData.email,
            password: validatedData.password,
        },
    );

        // jika login gagal
        if (authError) {
            console.error('Supabase Auth Error:', authError);
            return {
                success: false,
                error: authError.message,
            };
        }

        // jika email belum terverifikasi
        if (authData?.user?.email_confirmed_at === null) {
            
            return {
                success: true,
                needsEmailConfirmation: true,
            };
        }

        // mendapatkan role pengguna dari tabel 'users'
        const { data: userData, error: userError } = await supabase.from('users').select('role').eq('id', authData.user.id).single();

        // jika login berhasil
        return {
            success: true,
            nextLink: userData?.role === "admin" ? '/admin' : "/reviewer",
        };



    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation Error:', error.errors);
            return {
                success: false,
                error: error.errors.map(e => e.message).join(', '),
            };
        }else {
            if(error instanceof Error && error.message === 'Email not confirmed') {
                resendConfirmationEmail(data.email);
                return {
                    success: false,
                    error: 'Email not confirmed',
                };
            }
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
            };

        }
    }
    
}


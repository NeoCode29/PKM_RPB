"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function resendConfirmationEmail(email :string ) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
  
    if (error) {
      console.error('Gagal mengirim ulang email verifikasi:', error.message);
    } else {
      console.log('Email verifikasi telah dikirim ulang. Silakan periksa kotak masuk Anda.');
    }
  }
  
"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function resendConfirmationEmail(email: string) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
  
    if (error) {
      // Handle error
    } else {
      // Handle success
    }
  }
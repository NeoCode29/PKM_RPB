"use server"

import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutUser() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  
  // Redirect ke halaman login
  redirect("/auth/login");
}

export async function changePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  // Validasi password
  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Password minimal harus 6 karakter"
    };
  }
  
  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Konfirmasi password tidak cocok"
    };
  }
  
  try {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      message: "Password berhasil diubah"
    };
    
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengubah password"
    };
  }
} 
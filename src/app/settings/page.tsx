"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { changePassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { EyeIcon, EyeOffIcon, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await changePassword(formData);
      
      if (result.success) {
        toast({
          title: "Berhasil!",
          description: result.message,
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Gagal ganti password",
          description: result.error,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal mengubah password, silakan coba lagi nanti.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h1>
            <p className="text-muted-foreground mt-1">
              Kelola pengaturan dan preferensi akun Anda
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>
                Ubah password akun Anda untuk keamanan yang lebih baik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      placeholder="Masukkan password baru"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      placeholder="Konfirmasi password baru"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                      </span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Simpan Password Baru"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keluar Aplikasi</CardTitle>
              <CardDescription>
                Akhiri sesi Anda pada perangkat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoutButton 
                variant="destructive"
                showIcon={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
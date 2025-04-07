'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { resendConfirmationEmail } from './actions';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsDisabled(false);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isDisabled, timer]);

  const handleResend = async () => {
    if (!email) {
      console.error('Harap masukkan alamat email.');
      return;
    }

    await resendConfirmationEmail(email);

    setIsDisabled(true);
    setTimer(60); // Mengatur timer selama 60 detik
  };

  
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MailCheck className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-xl font-bold">Verifikasi Email Anda</CardTitle>
          <CardDescription>
            Kami telah mengirimkan email verifikasi ke
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertTitle className="font-medium text-blue-800">{email}</AlertTitle>
            <AlertDescription className="text-blue-700">
              Silakan periksa kotak masuk Anda dan klik tautan verifikasi untuk mengaktifkan akun Anda.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4 text-sm text-gray-600">
            <p>
              Jika Anda tidak menerima email dalam beberapa menit, periksa folder spam atau junk Anda.
            </p>
            <p>
              Jika Anda masih belum menerimanya, Anda dapat mencoba mendaftar ulang atau menghubungi dukungan kami.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">

          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full">
              Kembali ke Login
            </Button>
          </Link>
          <Link href="/auth/register" className="w-full">
            <Button variant="ghost" className="w-full text-sm">
              Coba Daftar Ulang
            </Button>
          </Link>
          <Button onClick={handleResend} disabled={isDisabled} className="w-full" variant="default">
            {isDisabled ? `Kirim Ulang (${timer})` : 'Kirim Ulang Email Verifikasi'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Removed the local declaration of resendConfirmationEmail to avoid conflict with the imported one.

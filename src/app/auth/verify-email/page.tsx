'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MailCheck, LogIn, UserPlus, RefreshCw } from 'lucide-react';
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
      return;
    }

    await resendConfirmationEmail(email);

    setIsDisabled(true);
    setTimer(60); // Mengatur timer selama 60 detik
  };

  
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <MailCheck className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black">Verifikasi Email Anda</CardTitle>
          <CardDescription className="text-gray-700">
            Kami telah mengirimkan email verifikasi ke
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertTitle className="font-medium text-black">{email}</AlertTitle>
            <AlertDescription className="text-gray-800">
              Silakan periksa kotak masuk Anda dan klik tautan verifikasi untuk mengaktifkan akun Anda.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4 text-sm text-gray-800">
            <p>
              Jika Anda tidak menerima email dalam beberapa menit, periksa folder spam atau junk Anda.
            </p>
            <p>
              Jika Anda masih belum menerimanya, Anda dapat mencoba mendaftar ulang atau menghubungi dukungan kami.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pb-6">
          <Link href="/auth/login" className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-11 bg-white border-blue-300 text-black hover:bg-blue-50 hover:text-black hover:border-blue-400 transition-all duration-200 font-medium"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Button>
          </Link>
          
          <Link href="/auth/register" className="w-full">
            <Button 
              variant="ghost" 
              className="w-full h-11 text-black hover:bg-gray-100 hover:text-black transition-all duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Coba Daftar Ulang
            </Button>
          </Link>
          
          <Button 
            onClick={handleResend} 
            disabled={isDisabled} 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isDisabled ? 'animate-spin' : ''}`} />
            {isDisabled ? `Kirim Ulang (${timer})` : 'Kirim Ulang Email Verifikasi'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Removed the local declaration of resendConfirmationEmail to avoid conflict with the imported one.

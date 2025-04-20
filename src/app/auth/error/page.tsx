// File: app/auth/error/page.tsx

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParamsStore = await searchParams;
  const error = searchParamsStore.error || 'Terjadi kesalahan autentikasi';
  
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold">Error Autentikasi</CardTitle>
          <CardDescription>
            Terjadi kesalahan saat proses autentikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="font-medium">Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4 text-sm text-gray-600">
            <p>
              Silakan coba lagi atau hubungi administrator sistem jika masalah berlanjut.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/login" className="w-1/2 pr-1">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
          <Link href="/register" className="w-1/2 pl-1">
            <Button variant="default" className="w-full">
              Register
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
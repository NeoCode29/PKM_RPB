'use client';

import { useEffect } from 'react';
import { PenilaianAdministrasiForm } from '@/components/reviewer/PenilaianAdministrasiForm';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface PenilaianAdministrasiClientFormProps {
  proposalId: number;
  bidangId: number;
  userId: string;
}

export function PenilaianAdministrasiClientForm({ 
  proposalId, 
  bidangId, 
  userId 
}: PenilaianAdministrasiClientFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  // Handle errors
  useEffect(() => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'ID pengguna tidak valid. Silakan login kembali.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [userId, toast, router]);
  
  // Tampilkan pesan jika userId tidak valid
  if (!userId) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <FileText size={48} className="text-gray-400" />
        </div>
        <CardTitle className="mb-2">Data Tidak Tersedia</CardTitle>
        <CardDescription>
          Tidak dapat memuat data penilaian. Silakan coba lagi nanti.
        </CardDescription>
        <CardFooter className="justify-center pt-4">
          <Button onClick={() => router.push('/login')}>
            Login Kembali
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return <PenilaianAdministrasiForm proposalId={proposalId} bidangId={bidangId} userId={userId} />;
} 
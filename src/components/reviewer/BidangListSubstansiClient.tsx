'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardTitle, 
  CardDescription, 
  CardHeader, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePenilaianBidang } from '@/hooks/use-penilaian-administrasi';
import { useToast } from '@/components/ui/use-toast';
import { Folder, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function BidangListSubstansiClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Dapatkan userId dari client
  useEffect(() => {
    // Cek jika di browser
    if (typeof window !== 'undefined') {
      try {
        const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '';
        // Pastikan userId valid
        if (storedUserId && storedUserId !== 'undefined' && storedUserId !== 'null') {
          setUserId(storedUserId);
        } else {
          // Jika tidak valid, set null dan tampilkan pesan
          setUserId(null);
          toast({
            title: 'Error',
            description: 'ID pengguna tidak valid. Silakan login kembali.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        setUserId(null);
      }
      setIsLoading(false);
    }
  }, [toast]);
  
  // Hanya jalankan hook jika userId valid
  const { bidangList, loading, error, refreshBidangList } = usePenilaianBidang(
    userId || '' // Jika null, kirim string kosong (hook akan handle internal loading state)
  );
  
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Perbedaan utama ada di sini, mengarah ke URL penilaian substansi
  const handleBidangClick = (bidangId: number) => {
    router.push(`/reviewer/penilaian-substansi/${bidangId}`);
  };
  
  const getBidangColor = (index: number) => {
    const colors = [
      'border-t-blue-500',
      'border-t-green-500',
      'border-t-yellow-500',
      'border-t-red-500',
      'border-t-purple-500',
      'border-t-pink-500',
      'border-t-indigo-500',
      'border-t-teal-500'
    ];
    return colors[index % colors.length];
  };
  
  // Tampilkan loading state saat memuat userId
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Memuat data pengguna...</span>
      </div>
    );
  }
  
  // Tampilkan pesan jika userId tidak valid
  if (!userId) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <FileText size={48} className="text-gray-400" />
        </div>
        <CardTitle className="mb-2">Tidak Dapat Memuat Data</CardTitle>
        <CardDescription>
          Sesi login Anda mungkin telah berakhir. Silakan login kembali.
        </CardDescription>
        <CardFooter className="justify-center pt-4">
          <Button onClick={() => router.push('/login')}>
            Login Kembali
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Loading state saat mengambil daftar bidang
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((_, i) => (
          <Card key={i} className="border-t-4 border-t-gray-300">
            <CardHeader>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-24 mb-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Tampilkan pesan jika tidak ada bidang
  if (bidangList.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <FileText size={48} className="text-gray-400" />
        </div>
        <CardTitle className="mb-2">Tidak Ada Proposal</CardTitle>
        <CardDescription>
          Anda belum memiliki proposal yang perlu dinilai
        </CardDescription>
      </Card>
    );
  }
  
  // Tampilkan daftar bidang
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bidangList.map((bidang, index) => (
        <Card 
          key={bidang.id_bidang_pkm}
          className={`border-t-4 hover:shadow-md transition-shadow cursor-pointer ${getBidangColor(index)}`}
          onClick={() => handleBidangClick(bidang.id_bidang_pkm)}
        >
          <CardHeader>
            <CardTitle>{bidang.nama}</CardTitle>
            <CardDescription>Bidang PKM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {bidang.count}
            </div>
            <div className="text-sm text-muted-foreground">
              Proposal yang perlu dinilai
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Lihat Proposal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 
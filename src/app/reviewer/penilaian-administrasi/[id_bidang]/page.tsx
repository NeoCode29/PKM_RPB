import { Suspense } from 'react';
import { ProposalListClient } from '@/components/reviewer/ProposalListClient';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserId } from '@/lib/auth/get-user-id';
import { redirect } from 'next/navigation';
import { BackButton } from '@/components/reviewer/BackButton';
import { BidangPkmService } from '@/services/bidang-pkm-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Loading state component
function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-24" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      <div className="rounded-md border p-4">
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

// Komponen untuk error state
function ErrorState() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.
      </AlertDescription>
    </Alert>
  );
}

// Fungsi untuk mendapatkan nama bidang
async function getBidangName(bidangId: number) {
  try {
    const bidang = await BidangPkmService.getById(bidangId);
    return bidang?.nama || 'Bidang PKM';
  } catch (error) {
    console.error('Error fetching bidang name:', error);
    return 'Bidang PKM';
  }
}

export default async function ProposalListPage({ params }: { params: { id_bidang: string } }) {
  let userId: string;
  
  try {
    userId = await getUserId();
  } catch (error) {
    console.error('Error getting user ID:', error);
    redirect('/login');
  }
  
  const bidangId = parseInt(params.id_bidang);
  
  if (isNaN(bidangId)) {
    redirect('/reviewer/penilaian-administrasi');
  }

  const bidangName = await getBidangName(bidangId);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton href="/reviewer/penilaian-administrasi" />
        <div>
          <h1 className="text-2xl font-bold">Penilaian Administrasi</h1>
          <p className="text-gray-500">{bidangName}</p>
        </div>
      </div>
      
      <Suspense fallback={<Loading />}>
        <ProposalListClient bidangId={bidangId} userId={userId} />
      </Suspense>
    </div>
  );
} 
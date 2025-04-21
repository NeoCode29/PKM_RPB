import { Suspense } from 'react';
import { BackButton } from '@/components/reviewer/BackButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ProposalListSubstansiClient } from '@/components/penilaian-substansi/ProposalListSubstansiClient';
import { getUserId } from '@/lib/auth/get-user-id';
import { redirect } from 'next/navigation';
import { BidangPkmService } from '@/services/bidang-pkm-service';

// Komponen untuk loading state
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
        <Skeleton className="h-[400px] w-full" />
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

export default async function BidangProposalPage({ 
  params 
}: { 
  params: any 
}) {
  const paramsStore = await params;
  let userId: string;
  
  try {
    userId = await getUserId();
  } catch (error) {
    redirect('/login');
  }
  
  const bidangId = parseInt(paramsStore.id_bidang);
  
  if (isNaN(bidangId)) {
    redirect('/reviewer/penilaian-substansi');
  }

  const bidangName = await getBidangName(bidangId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton href="/reviewer/penilaian-substansi" />
        <div>
          <h1 className="text-2xl font-bold">Penilaian Substansi</h1>
          <p className="text-gray-500">{bidangName}</p>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <ProposalListSubstansiClient userId={userId} bidangId={bidangId} />
      </Suspense>
    </div>
  );
} 
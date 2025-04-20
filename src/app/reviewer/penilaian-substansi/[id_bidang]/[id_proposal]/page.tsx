import { Suspense } from 'react';
import { BackButton } from '@/components/reviewer/BackButton';
import { ProposalDetailCard } from '@/components/reviewer/ProposalDetailCard';
import { ProposalService } from '@/services/proposal-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PenilaianSubstansiClientForm } from '@/components/reviewer/PenilaianSubstansiClient';
import { getUserId } from '@/lib/auth/get-user-id';
import { redirect } from 'next/navigation';

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
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}

// Komponen untuk mendapatkan proposal detail
async function getProposalDetail(proposalId: number) {
  try {
    return await ProposalService.getById(proposalId);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }
}

// Komponen untuk error state
function ErrorState() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Terjadi kesalahan saat memuat data proposal. Silakan coba lagi nanti.
      </AlertDescription>
    </Alert>
  );
}

export default async function PenilaianSubstansiPage({ 
  params 
}: { 
  params: any
}) {
  const paramsStore = await params;
  let userId: string;
  
  try {
    userId = await getUserId();
  } catch (error) {
    console.error('Error getting user ID:', error);
    redirect('/login');
  }
  
  const bidangId = parseInt(paramsStore.id_bidang);
  const proposalId = parseInt(paramsStore.id_proposal);
  
  // Fetch proposal data
  const proposal = await getProposalDetail(proposalId);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton href={`/reviewer/penilaian-substansi/${bidangId}`} />
        <h1 className="text-2xl font-bold">Penilaian Substansi</h1>
      </div>
      
      {!proposal ? (
        <ErrorState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolom kiri - Form Penilaian */}
          <div className="md:col-span-2 space-y-6">
            {/* Detail Proposal */}
            <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
              <ProposalDetailCard proposal={proposal} showBasicInfoOnly={true} />
            </Suspense>
            
            {/* Form Penilaian (Client Component) */}
            <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
              <PenilaianSubstansiClientForm 
                bidangId={bidangId} 
                proposalId={proposalId}
                userId={userId}
              />
            </Suspense>
          </div>
          
          {/* Kolom kanan - Informasi Pengusul dan pendanaan */}
          <div className="space-y-6">
            <Suspense fallback={<Skeleton className="h-full w-full rounded-lg" />}>
              <ProposalDetailCard proposal={proposal} showDetailOnly={true} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
} 
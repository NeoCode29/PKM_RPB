import { Suspense } from 'react';
import { ProposalListClient } from '@/components/reviewer/ProposalListClient';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserId } from '@/lib/auth/get-user-id';
import { redirect } from 'next/navigation';

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

export default async function ProposalListPage({ params }: { params: { id_bidang: string } }) {
  let userId: string;
  
  try {
    userId = await getUserId();
  } catch (error) {
    console.error('Error getting user ID:', error);
    redirect('/login');
  }
  const paramsStore = await params;
  
  const bidangId = parseInt(paramsStore.id_bidang);
  
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<Loading />}>
        <ProposalListClient bidangId={bidangId} userId={userId} />
      </Suspense>
    </div>
  );
} 
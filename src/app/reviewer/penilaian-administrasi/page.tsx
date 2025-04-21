import { Suspense } from 'react';
import { BidangListClient } from '@/components/reviewer/BidangListClient';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import { getUserId } from '@/lib/auth/get-user-id';

// Loading state component
function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function PenilaianAdministrasiPage() {
  // Get userId from headers (SSR) with error handling
  let userId: string;
  
  try {
    userId = await getUserId();
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Penilaian Administrasi</h1>
        <p className="text-muted-foreground">
          Pilih bidang PKM untuk melihat proposal yang perlu dinilai
        </p>
      </div>
      
      <Suspense fallback={<Loading />}>
        <BidangListClient userId={userId} />
      </Suspense>
    </div>
  );
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ReportDetail from '@/components/report/ReportDetail';

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const paramsStore = await params;
  const id = parseInt(paramsStore.id);
  
  // Validate ID
  if (isNaN(id)) {
    notFound();
  }
  
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ReportDetail proposalId={id} />
    </Suspense>
  );
} 
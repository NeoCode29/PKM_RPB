import { headers } from 'next/headers';
import { ReviewerDashboardContent } from '@/components/reviewer/DashboardContent';
import { ReviewerSummaryCards } from '@/components/reviewer/ReviewerSummaryCards';

export default async function ReviewerDashboard() {
  // Ini adalah komponen server-side
  const headersList = await headers();
  
  // Ambil user ID dari header, jika tidak ada, gunakan string kosong
  const userId = headersList.get('pkm-user-id') || '';

  console.log('Server-side: Extracted userId from header:', userId);
  
  return (
    <div className="space-y-6 p-6">
      {/* Ringkasan kartu statistik */}
      <ReviewerSummaryCards userId={userId} />
      
      {/* Konten dashboard */}
      <ReviewerDashboardContent userId={userId} />
    </div>
  );
}
  
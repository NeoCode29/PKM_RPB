'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenilaianSubstansiService } from '@/services/penilaian-substansi-service';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface BidangCount {
  id_bidang_pkm: number;
  nama: string;
  count: number;
}

interface PenilaianSubstansiContentProps {
  userId: string;
}

export function PenilaianSubstansiContent({ userId }: PenilaianSubstansiContentProps) {
  const [bidangCounts, setBidangCounts] = useState<BidangCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        const data = await PenilaianSubstansiService.getProposalCountByBidang(userId);
        setBidangCounts(data);
      } catch (error) {
        console.error('Error fetching bidang counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Penilaian Substansi Proposal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bidangCounts.map((bidang) => (
          <Link 
            key={bidang.id_bidang_pkm} 
            href={`/reviewer/penilaian-substansi/${bidang.id_bidang_pkm}`}
          >
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{bidang.nama}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {bidang.count} Proposal perlu dinilai
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 
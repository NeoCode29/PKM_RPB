'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewerService, ReviewerStats } from '@/services/reviewer-service';
import { ProposalWithRelations } from '@/services/proposal-service';
import { useToast } from '@/components/ui/use-toast';
import { ProposalService } from '@/services/proposal-service';
import { ProposalWithRelations as ProposalWithRelationsType } from '@/types/proposal';

export const useReviewerDashboard = (reviewerId: string) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReviewerStats>({
    totalProposals: 0,
    assignedProposals: 0,
    unratedProposals: 0
  });
  const [proposals, setProposals] = useState<ProposalWithRelationsType[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Mendapatkan ID reviewer dari prop atau localStorage
  const getUserId = (): string | null => {
    // Prioritaskan reviewerId dari prop jika tersedia
    if (reviewerId) {
      console.log('Menggunakan reviewerId dari prop:', reviewerId);
      return reviewerId;
    }
    
    // Fallback ke localStorage jika prop tidak tersedia
    if (typeof window !== 'undefined') {
      const localId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      console.log('Menggunakan reviewerId dari localStorage:', localId);
      return localId;
    }
    
    return null;
  };

  // Fungsi untuk memuat data dashboard reviewer
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();
      
      console.log('fetchDashboardData - userId yang digunakan:', userId);
      
      // Jika user ID tidak tersedia, mungkin user tidak login
      if (!userId) {
        console.warn('User ID tidak tersedia, mengarahkan ke halaman login');
        router.push('/auth/login');
        return;
      }

      // Ambil proposal yang ditugaskan ke reviewer
      const proposalsData = await ReviewerService.getAssignedProposals(userId);
      console.log('Proposal yang diterima:', proposalsData);
      
      // Ubah format data proposal untuk UI
      const proposalsWithReviewStatus = proposalsData.map(proposal => ({
        ...proposal,
        isReviewed: proposal.status_penilaian === 'reviewed'
      }));
      
      setProposals(proposalsWithReviewStatus);

      // Ambil statistik reviewer
      const statsData = await ReviewerService.getReviewerStats(userId);
      setStats(statsData);

    } catch (err: any) {
      console.error('Error saat memuat data dashboard reviewer:', err);
      setError(new Error(err.message || 'Gagal memuat data dashboard reviewer'));
      toast({
        title: 'Error',
        description: 'Gagal memuat data dashboard reviewer. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Memuat data saat komponen dimount atau reviewerId berubah
  useEffect(() => {
    console.log('useEffect triggered, reviewerId:', reviewerId);
    fetchDashboardData();
  }, [reviewerId]);

  const refreshProposals = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID tidak tersedia');
      }
      
      console.log('refreshProposals - menggunakan userId:', userId);
      
      // Gunakan ProposalService untuk mendapatkan proposal
      const reviewerProposals = await ProposalService.getProposalsByReviewerId(userId);
      console.log('Proposal yang diterima dari refreshProposals:', reviewerProposals);
      
      // Pastikan data memiliki format yang sesuai dengan kebutuhan UI
      const proposalsWithReviewStatus = reviewerProposals.map(proposal => {
        // Pastikan kita menggunakan property yang benar
        const isReviewed = proposal.status_penilaian === 'reviewed' || 
                         (proposal as any).review_status === 'reviewed';
        
        return {
          ...proposal,
          isReviewed
        };
      });
      
      // Gunakan type assertion untuk mengatasi error TypeScript
      setProposals(proposalsWithReviewStatus as unknown as ProposalWithRelationsType[]);
    } catch (err: any) {
      console.error('Error saat menyegarkan data proposal:', err);
      setError(new Error(err.message || 'Gagal menyegarkan data proposal'));
      toast({
        title: 'Error',
        description: 'Gagal menyegarkan data proposal. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    stats,
    proposals,
    error,
    refreshData: fetchDashboardData,
    refreshProposals,
    isLoading: loading
  };
}; 
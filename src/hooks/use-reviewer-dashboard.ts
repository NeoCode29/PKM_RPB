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
    if (reviewerId) {
      return reviewerId;
    }
    
    if (typeof window !== 'undefined') {
      const localId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
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
      
      if (!userId) {
        router.push('/auth/login');
        return;
      }

      const proposalsData = await ReviewerService.getAssignedProposals(userId);
      
      const proposalsWithReviewStatus = proposalsData.map(proposal => ({
        ...proposal,
        isReviewed: proposal.status_penilaian === 'reviewed'
      }));
      
      setProposals(proposalsWithReviewStatus);

      const statsData = await ReviewerService.getReviewerStats(userId);
      setStats(statsData);

    } catch (err: any) {
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
      
      const reviewerProposals = await ProposalService.getProposalsByReviewerId(userId);
      
      const proposalsWithReviewStatus = reviewerProposals.map(proposal => {
        const isReviewed = proposal.status_penilaian === 'reviewed' || 
                         (proposal as any).review_status === 'reviewed';
        
        return {
          ...proposal,
          isReviewed
        };
      });
      
      setProposals(proposalsWithReviewStatus as unknown as ProposalWithRelationsType[]);
    } catch (err: any) {
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
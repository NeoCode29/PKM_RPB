'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, ClipboardCheck, CheckSquare } from 'lucide-react';
import { PenilaianAdministrasiService } from '@/services/penilaian-administrasi-service';
import { PenilaianSubstansiService } from '@/services/penilaian-substansi-service';
import { ReviewerService } from '@/services/reviewer-service';

interface ReviewerDashboardContentProps {
  userId: string;
}

export default function ReviewerDashboardContent({ userId }: ReviewerDashboardContentProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedProposals: 0,
    completedAdministrasi: 0,
    completedSubstansi: 0
  });

  useEffect(() => {
    const fetchReviewerStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Ambil proposal yang ditugaskan ke reviewer
        const proposalsData = await ReviewerService.getAssignedProposals(userId);
        const totalAssigned = proposalsData.length;
        
        // Inisialisasi counter
        let completedAdm = 0;
        let completedSubs = 0;
        
        // Periksa setiap proposal untuk status penilaian
        for (const proposal of proposalsData) {
          if (!proposal.id_proposal) continue;
          
          // Cek penilaian administrasi
          try {
            const admResult = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
              userId,
              proposal.id_proposal
            );
            
            if (admResult?.penilaian?.status === true) {
              completedAdm++;
            }
          } catch (error) {
            console.error('Error checking administrasi status:', error);
          }
          
          // Cek penilaian substansi
          try {
            const subsResult = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
              userId,
              proposal.id_proposal
            );
            
            if (subsResult?.penilaian?.status === true) {
              completedSubs++;
            }
          } catch (error) {
            console.error('Error checking substansi status:', error);
          }
        }
        
        // Update statistik
        setStats({
          assignedProposals: totalAssigned,
          completedAdministrasi: completedAdm,
          completedSubstansi: completedSubs
        });
        
      } catch (error) {
        console.error('Error fetching reviewer stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewerStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Memuat data...</p>
      </div>
    );
  }

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard Reviewer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Proposal Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Total Proposal
            </CardTitle>
            <CardDescription>Jumlah proposal yang ditugaskan kepada Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.assignedProposals}</p>
          </CardContent>
        </Card>
        
        {/* Administrasi Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5 text-amber-500" />
              Penilaian Administrasi
            </CardTitle>
            <CardDescription>Progress penilaian administrasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">
                {stats.completedAdministrasi}/{stats.assignedProposals}
              </p>
              <p className="text-sm text-muted-foreground">
                {getProgressPercentage(stats.completedAdministrasi, stats.assignedProposals)}%
              </p>
            </div>
            <Progress 
              value={getProgressPercentage(stats.completedAdministrasi, stats.assignedProposals)} 
              className="h-2" 
            />
          </CardContent>
        </Card>
        
        {/* Substansi Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-green-500" />
              Penilaian Substansi
            </CardTitle>
            <CardDescription>Progress penilaian substansi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">
                {stats.completedSubstansi}/{stats.assignedProposals}
              </p>
              <p className="text-sm text-muted-foreground">
                {getProgressPercentage(stats.completedSubstansi, stats.assignedProposals)}%
              </p>
            </div>
            <Progress 
              value={getProgressPercentage(stats.completedSubstansi, stats.assignedProposals)} 
              className="h-2" 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
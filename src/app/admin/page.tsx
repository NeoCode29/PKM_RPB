'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProposalService } from '@/services/proposal-service';
import { PenilaianAdministrasiService } from '@/services/penilaian-administrasi-service';
import { PenilaianSubstansiService } from '@/services/penilaian-substansi-service';
import { Loader2, FileText, Users, CheckCircle, PieChart, BarChart3, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProposals: 0,
    totalReviewers: 0,
    proposalsWithAdministrasi: 0,
    proposalsWithSubstansi: 0,
    bidangStats: [] as {id_bidang_pkm: number, nama: string, count: number}[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Ambil semua proposal
        const proposalResult = await ProposalService.getAll({
          pageSize: 500 // Ambil semua proposal
        });
        
        // Set total proposal
        const proposals = proposalResult.data || [];
        const totalProposals = proposals.length;
        
        // Hitung total reviewer unik
        const uniqueReviewers = new Set();
        proposals.forEach(proposal => {
          if (proposal.reviewers && proposal.reviewers.length > 0) {
            proposal.reviewers.forEach(reviewer => {
              if (reviewer.id_user) {
                uniqueReviewers.add(reviewer.id_user);
              }
            });
          }
        });
        
        // Cek penilaian administrasi dan substansi
        let proposalsWithAdministrasi = 0;
        let proposalsWithSubstansi = 0;
        
        for (const proposal of proposals) {
          if (!proposal.reviewers || proposal.reviewers.length === 0) continue;
          
          let hasAllAdministrasi = false;
          let hasAllSubstansi = false;
          
          if (proposal.reviewers.length === 2) {
            // Jika ada 2 reviewer, cek apakah keduanya sudah dinilai
            const adminResults = await Promise.all(
              proposal.reviewers.map(reviewer => 
                reviewer.id_user ? 
                  PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
                    reviewer.id_user.toString(), 
                    proposal.id_proposal
                  ) : 
                  Promise.resolve(null)
              )
            );
            
            const subsResults = await Promise.all(
              proposal.reviewers.map(reviewer => 
                reviewer.id_user ? 
                  PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
                    reviewer.id_user.toString(), 
                    proposal.id_proposal
                  ) : 
                  Promise.resolve(null)
              )
            );
            
            // Periksa apakah kedua reviewer sudah melakukan penilaian administrasi
            hasAllAdministrasi = adminResults.every(result => result?.penilaian?.status === true);
            
            // Periksa apakah kedua reviewer sudah melakukan penilaian substansi
            hasAllSubstansi = subsResults.every(result => result?.penilaian?.status === true);
          } else {
            // Jika hanya 1 reviewer, cek apakah sudah dinilai
            const reviewer = proposal.reviewers[0];
            if (reviewer.id_user) {
              const adminResult = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
                reviewer.id_user.toString(),
                proposal.id_proposal
              );
              
              const subsResult = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
                reviewer.id_user.toString(),
                proposal.id_proposal
              );
              
              hasAllAdministrasi = adminResult?.penilaian?.status === true;
              hasAllSubstansi = subsResult?.penilaian?.status === true;
            }
          }
          
          if (hasAllAdministrasi) proposalsWithAdministrasi++;
          if (hasAllSubstansi) proposalsWithSubstansi++;
        }
        
        // Hitung jumlah proposal per bidang PKM
        const bidangCounts: Record<number, {nama: string, count: number}> = {};
        
        proposals.forEach(proposal => {
          if (proposal.bidang_pkm && proposal.bidang_pkm.id_bidang_pkm) {
            const bidangId = proposal.bidang_pkm.id_bidang_pkm;
            if (!bidangCounts[bidangId]) {
              bidangCounts[bidangId] = {
                nama: proposal.bidang_pkm.nama || `Bidang ${bidangId}`,
                count: 0
              };
            }
            bidangCounts[bidangId].count++;
          }
        });
        
        // Convert to array for easier rendering
        const bidangStats = Object.entries(bidangCounts).map(([id, data]) => ({
          id_bidang_pkm: parseInt(id),
          nama: data.nama,
          count: data.count
        })).sort((a, b) => b.count - a.count);
        
        setStats({
          totalProposals,
          totalReviewers: uniqueReviewers.size,
          proposalsWithAdministrasi,
          proposalsWithSubstansi,
          bidangStats
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Memuat data dashboard...</p>
      </div>
    );
  }
  
  // Helper function for percentage calculation
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-1">Ringkasan sistem manajemen proposal PKM</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/proposal')} variant="outline" className="flex gap-2 items-center">
            <FileText className="h-4 w-4" /> Kelola Proposal
          </Button>
          <Button onClick={() => router.push('/admin/report')} className="flex gap-2 items-center">
            <BarChart3 className="h-4 w-4" /> Lihat Laporan
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Jumlah Proposal */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Total Proposal
            </CardTitle>
            <CardDescription>Jumlah keseluruhan proposal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalProposals}</p>
          </CardContent>
        </Card>
        
        {/* Card Jumlah Reviewer */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-500" />
              Total Reviewer
            </CardTitle>
            <CardDescription>Jumlah reviewer aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalReviewers}</p>
          </CardContent>
        </Card>
        
        {/* Card Proposal dengan Penilaian Administrasi */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-amber-500" />
              Penilaian Administrasi
            </CardTitle>
            <CardDescription>Progres penilaian administrasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold">{stats.proposalsWithAdministrasi}</p>
              <Badge variant="outline">
                {getPercentage(stats.proposalsWithAdministrasi, stats.totalProposals)}%
              </Badge>
            </div>
            <Progress 
              value={getPercentage(stats.proposalsWithAdministrasi, stats.totalProposals)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {stats.proposalsWithAdministrasi} dari {stats.totalProposals} proposal
            </p>
          </CardContent>
        </Card>
        
        {/* Card Proposal dengan Penilaian Substansi */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-purple-500" />
              Penilaian Substansi
            </CardTitle>
            <CardDescription>Progres penilaian substansi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold">{stats.proposalsWithSubstansi}</p>
              <Badge variant="outline">
                {getPercentage(stats.proposalsWithSubstansi, stats.totalProposals)}%
              </Badge>
            </div>
            <Progress 
              value={getPercentage(stats.proposalsWithSubstansi, stats.totalProposals)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {stats.proposalsWithSubstansi} dari {stats.totalProposals} proposal
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi per Bidang PKM */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-indigo-500" />
              Distribusi Proposal per Bidang PKM
            </CardTitle>
            <CardDescription>
              Jumlah proposal berdasarkan bidang PKM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.bidangStats.map(bidang => (
                <div key={bidang.id_bidang_pkm} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{bidang.nama}</span>
                    <span className="text-muted-foreground">{bidang.count} proposal</span>
                  </div>
                  <Progress 
                    value={getPercentage(bidang.count, stats.totalProposals)} 
                    className="h-2"
                  />
                </div>
              ))}
              
              {stats.bidangStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data bidang PKM
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
              Aksi Cepat
            </CardTitle>
            <CardDescription>
              Tindakan yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => router.push('/admin/proposal/add')} variant="outline" className="w-full justify-start" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Tambah Proposal Baru
            </Button>
            <Button onClick={() => router.push('/admin/users')} variant="outline" className="w-full justify-start" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Kelola Pengguna
            </Button>
            <Button onClick={() => router.push('/admin/report/download')} variant="outline" className="w-full justify-start" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

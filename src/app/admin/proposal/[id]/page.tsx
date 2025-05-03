"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProposalDetail } from "@/hooks/use-proposals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProposalDialog } from "@/components/proposal/proposal-dialog";
import { DeleteConfirmation } from "@/components/proposal/delete-confirmation";
import { 
  ArrowLeft, 
  Loader2, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  UserCircle,
  UserCheck,
  Wallet,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { ProposalService } from "@/services/proposal-service";
import { PenilaianAdministrasiService } from "@/services/penilaian-administrasi-service";
import { PenilaianSubstansiService } from "@/services/penilaian-substansi-service";

// Status mapping untuk badge
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  'Belum Dinilai': 'secondary',
  'Sedang Ditinjau': 'warning',
  'Diterima': 'success',
  'Ditolak': 'destructive'
};

// Icon mapping untuk status
const StatusIcon = ({status}: {status: string | null}) => {
  if (!status) return null;
  
  switch(status) {
    case 'Belum Dinilai':
      return <Clock className="mr-2 h-4 w-4" />;
    case 'Sedang Ditinjau':
      return <Eye className="mr-2 h-4 w-4" />;
    case 'Diterima':
      return <CheckCircle className="mr-2 h-4 w-4" />;
    case 'Ditolak':
      return <XCircle className="mr-2 h-4 w-4" />;
    default:
      return null;
  }
};

export default function ProposalDetailPage({ params }: { params: any }) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Gunakan React.use() untuk mengatasi peringatan Next.js 15
  const resolvedParams = React.use(params) as { id: string };
  const proposalId = parseInt(resolvedParams.id);
  
  // Gunakan hook proposal detail
  const { 
    proposal, 
    loading, 
    error, 
    updateProposal,
    refreshProposal 
  } = useProposalDetail(proposalId);
  
  // State untuk dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'edit' | 'view'>('view');
  
  // State untuk opsi bidang dan reviewer
  const [bidangOptions, setBidangOptions] = useState<any[]>([]);
  const [reviewerOptions, setReviewerOptions] = useState<any[]>([]);
  
  // State untuk status penilaian reviewer
  const [reviewerPenilaianStatus, setReviewerPenilaianStatus] = useState<{
    [key: string]: { administrasi: boolean; substansi: boolean };
  }>({});
  
  // Ambil opsi bidang dan reviewer
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Gunakan ProposalService untuk mendapatkan data dari database
        const bidang = await ProposalService.getAllBidangPkm();
        setBidangOptions(bidang);
        
        // Dapatkan daftar reviewer dari database
        const reviewers = await ProposalService.getAvailableReviewers();
        setReviewerOptions(reviewers);
        
        console.log("Data reviewer dari database:", reviewers);
      } catch (err) {
        console.error("Error fetching options:", err);
        toast({
          title: "Error",
          description: "Gagal memuat data bidang PKM dan reviewer",
          variant: "destructive",
        });
      }
    };
    
    fetchOptions();
  }, [toast]);
  
  // Ambil status penilaian untuk setiap reviewer
  useEffect(() => {
    const fetchPenilaianStatus = async () => {
      if (!proposal || !proposal.reviewers || proposal.reviewers.length === 0) return;
      
      const statusMap: {
        [key: string]: { administrasi: boolean; substansi: boolean };
      } = {};
      
      for (const reviewer of proposal.reviewers) {
        if (!reviewer.id_user) continue;
        
        try {
          // Cek penilaian administrasi
          const admResult = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
            reviewer.id_user.toString(),
            proposal.id_proposal
          );
          
          // Cek penilaian substansi
          const subsResult = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
            reviewer.id_user.toString(),
            proposal.id_proposal
          );
          
          statusMap[reviewer.id_reviewer.toString()] = {
            administrasi: admResult?.penilaian.status || false,
            substansi: subsResult?.penilaian.status || false
          };
        } catch (err) {
          console.error(`Error fetching penilaian status for reviewer ${reviewer.id_reviewer}:`, err);
        }
      }
      
      setReviewerPenilaianStatus(statusMap);
    };
    
    fetchPenilaianStatus();
  }, [proposal]);
  
  // Handler untuk edit proposal
  const handleEdit = () => {
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Handler untuk hapus proposal
  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };
  
  // Handler untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    try {
      // Implementasi hapus
      // Untuk demo, buat simulasi hapus
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Proposal berhasil dihapus",
        description: "Anda akan dialihkan ke halaman daftar proposal",
      });
      
      // Redirect ke halaman daftar proposal
      setTimeout(() => {
        router.push('/admin/proposal');
      }, 1500);
    } catch (err) {
      console.error("Error deleting proposal:", err);
      toast({
        title: "Error",
        description: "Gagal menghapus proposal",
        variant: "destructive",
      });
    }
  };
  
  // Handler untuk save proposal
  const handleSaveProposal = async (data: any, mode: 'add' | 'edit') => {
    try {
      if (mode === 'edit' && proposal) {
        console.log("[PAGE] PROSES SIMPAN DIMULAI");
        console.log("[PAGE] Data untuk diupdate:", data);
        
        // Notifikasi sedang memperbarui
        toast({
          title: "Menyimpan perubahan...",
          description: "Mohon tunggu sebentar",
        });
        
        // Kumpulkan nilai yang ingin diupdate
        const updateValues = {
          ...data,
          // Pastikan nilai reviewer bukan string kosong untuk database
          reviewer1_id: data.reviewer1_id === "" ? null : data.reviewer1_id,
          reviewer2_id: data.reviewer2_id === "" ? null : data.reviewer2_id
        };
        
        console.log("[PAGE] Nilai akhir yang akan diupdate:", updateValues);
        
        // Update proposal dengan nilai yang sudah diproses
        const updatedProposal = await updateProposal(updateValues);
        console.log("[PAGE] Proposal berhasil diperbarui:", updatedProposal);
        
        // Tutup dialog
        setOpenDialog(false);
        
        // Notifikasi sukses
        toast({
          title: "Proposal berhasil diperbarui",
          description: "Data proposal telah diperbarui",
        });
        
        // Refresh data setelah jeda singkat untuk memastikan database sudah sinkron
        console.log("[PAGE] Memuat ulang data proposal...");
        setTimeout(async () => {
          try {
            await refreshProposal();
            console.log("[PAGE] Data proposal berhasil disegarkan");
          } catch (refreshError) {
            console.error("[PAGE] Error saat merefresh data:", refreshError);
            toast({
              title: "Perhatian",
              description: "Data telah disimpan, tapi perlu refresh halaman untuk melihat perubahan",
              variant: "destructive",
            });
          }
        }, 1500);
      }
      
      return Promise.resolve();
    } catch (err) {
      console.error("[PAGE] Error di handleSaveProposal:", err);
      toast({
        title: "Error",
        description: `Gagal memperbarui proposal: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
      return Promise.reject(err);
    }
  };
  
  // Fungsi untuk render reviewer card
  const renderReviewerCard = (reviewer: any) => {
    const status = reviewerPenilaianStatus[reviewer.id_reviewer.toString()] || { administrasi: false, substansi: false };
    
    return (
      <div key={reviewer.id_reviewer} className="p-3 border rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="mr-2">Reviewer {reviewer.no}</Badge>
          <div className="font-semibold text-primary">
            {reviewer.user?.username || 'Tidak Ada Nama'}
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <span className="w-36">Username:</span> 
            <span className="font-medium">{reviewer.user?.username || 'Tidak Ada Username'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-36">Email:</span> 
            <span>{reviewer.user?.email || 'Tidak Ada Email'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-36">Status Penilaian:</span> 
            <div className="flex space-x-2">
              <Badge variant={status.administrasi ? "success" : "secondary"}>
                {status.administrasi ? "Adm ✓" : "Adm ×"}
              </Badge>
              <Badge variant={status.substansi ? "success" : "secondary"}>
                {status.substansi ? "Sub ✓" : "Sub ×"}
              </Badge>
            </div>
          </div>    
        </div>
      </div>
    );
  };
  
  // Jika sedang loading, tampilkan loader
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat data proposal...</p>
        </div>
      </div>
    );
  }
  
  // Jika error, tampilkan pesan error
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>Terjadi kesalahan saat memuat data proposal. Silahkan coba lagi nanti.</p>
          
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => router.push('/admin/proposal')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }
  
  // Jika proposal tidak ditemukan
  if (!proposal) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Proposal Tidak Ditemukan</h2>
          <p>Proposal dengan ID {resolvedParams.id} tidak ditemukan.</p>
          
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => router.push('/admin/proposal')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/proposal')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-3xl font-bold">Detail Proposal</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom kiri - Info Utama */}
        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl">
                  {proposal.judul.length > 50 ? `${proposal.judul.substring(0, 47)}...` : proposal.judul}
                </CardTitle>
                <CardDescription>ID: {proposal.id_proposal}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{proposal.bidang_pkm?.nama || 'Tidak ada bidang'}</Badge>
                <Badge variant="outline">Anggota: {proposal.jumlah_anggota}</Badge>
                <Badge variant="outline">
                  {format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: id })}
                </Badge>
              </div>
              
              {proposal.url_file && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <a 
                    href={proposal.url_file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Lihat File Proposal
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </CardFooter>
          </Card>
          
          {/* Mahasiswa */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <UserCircle className="h-5 w-5 mr-2" />
                <CardTitle>Ketua Pengusul</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-medium">{proposal.mahasiswa?.nama || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIM</p>
                  <p className="font-medium">{proposal.mahasiswa?.nim || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Program Studi</p>
                  <p className="font-medium">{proposal.mahasiswa?.program_studi || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jurusan</p>
                  <p className="font-medium">{proposal.mahasiswa?.jurusan || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nomor HP</p>
                  <p className="font-medium">{proposal.mahasiswa?.nomer_hp || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{proposal.mahasiswa?.email || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Dosen */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                <CardTitle>Dosen Pembimbing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-medium">{proposal.dosen?.nama || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIDN</p>
                  <p className="font-medium">{proposal.dosen?.nidn || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{proposal.dosen?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nomor HP</p>
                  <p className="font-medium">{proposal.dosen?.nomer_hp || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Kolom kanan - Info tambahan */}
        <div className="space-y-4">
          {/* Pendanaan */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                <CardTitle>Detail Pendanaan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Dana Simbelmawa</p>
                  <p className="font-medium">
                    Rp {Number(proposal.detail_pendanaan?.dana_simbelmawa || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dana Perguruan Tinggi</p>
                  <p className="font-medium">
                    Rp {Number(proposal.detail_pendanaan?.dana_perguruan_tinggi || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dana Pihak Lain</p>
                  <p className="font-medium">
                    Rp {Number(proposal.detail_pendanaan?.dana_pihak_lain || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Total Pendanaan</p>
                <p className="font-bold text-lg">
                  Rp {
                    Number(
                      (proposal.detail_pendanaan?.dana_simbelmawa || 0) +
                      (proposal.detail_pendanaan?.dana_perguruan_tinggi || 0) +
                      (proposal.detail_pendanaan?.dana_pihak_lain || 0)
                    ).toLocaleString('id-ID')
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Reviewer */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <CardTitle>Reviewer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposal.reviewers && proposal.reviewers.length > 0 ? (
                <div className="space-y-4">
                  {proposal.reviewers
                    .sort((a, b) => a.no - b.no)
                    .map(reviewer => renderReviewerCard(reviewer))
                  }
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground border rounded-lg p-6">
                  <Users className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p className="font-medium">Belum ada reviewer yang ditugaskan</p>
                  <p className="text-sm">Klik tombol edit untuk menambahkan reviewer</p>
                </div>
              )}
              
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Reviewer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialog untuk edit proposal */}
      <ProposalDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        mode={dialogMode}
        proposal={proposal}
        bidangOptions={bidangOptions}
        reviewerOptions={reviewerOptions}
        onSave={handleSaveProposal}
        isLoading={loading}
      />
      
      {/* Dialog konfirmasi hapus */}
      <DeleteConfirmation
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        proposal={proposal}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </div>
  );
} 
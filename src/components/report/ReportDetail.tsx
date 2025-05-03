'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  Download, 
  ClipboardList, 
  FileSpreadsheet,
  ExternalLink 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProposalService, ProposalWithRelations } from '@/services/proposal-service';
import { 
  PenilaianAdministrasiService, 
  DetailPenilaianAdministrasi,
  PenilaianAdministrasi
} from '@/services/penilaian-administrasi-service';
import {
  PenilaianSubstansiService,
  DetailPenilaianSubstansi,
  PenilaianSubstansi
} from '@/services/penilaian-substansi-service';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import autoTable, { PageHook } from 'jspdf-autotable';
import { KriteriaAdministrasi } from '@/services/kriteria-administrasi-service';
import { KriteriaSubstansi } from '@/services/kriteria-substansi-service';

// Interface for autoTable didDrawPage parameter
interface HookData {
  pageNumber: number;
  pageCount: number;
  pageSize: {
    width: number;
    height: number;
  };
  finalY: number;
  cursor: {
    y: number;
  };
  settings: {
    margin: {
      left: number;
    };
  };
  doc: jsPDF;
}

// Interface for didParseCell column
interface HookData {
  pageNumber: number;
  pageCount: number;
  pageSize: {
    width: number;
    height: number;
  };
  finalY: number;
  cursor: {
    y: number;
  };
  settings: {
    margin: {
      left: number;
    };
  };
  doc: jsPDF;
}

// These interfaces extend the base interfaces to add catatan property
interface ExtendedDetailPenilaianAdministrasi extends DetailPenilaianAdministrasi {
  kriteria?: KriteriaAdministrasi;
  catatan?: string;
  kesalahan: boolean | null;
  id_detail_penilaian: number;
}

interface ExtendedDetailPenilaianSubstansi extends DetailPenilaianSubstansi {
  kriteria?: KriteriaSubstansi;
  catatan?: string;
  id: number;
}

interface ReportDetailProps {
  proposalId: number;
}

export default function ReportDetail({ proposalId }: ReportDetailProps) {
  const router = useRouter();
  
  const [proposal, setProposal] = useState<ProposalWithRelations | null>(null);
  const [penilaianAdministrasi, setPenilaianAdministrasi] = useState<ExtendedDetailPenilaianAdministrasi[]>([]);
  const [penilaianSubstansi, setPenilaianSubstansi] = useState<ExtendedDetailPenilaianSubstansi[]>([]);
  const [totalNilaiSubstansi, setTotalNilaiSubstansi] = useState<number>(0);
  const [totalKesalahanAdministrasi, setTotalKesalahanAdministrasi] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isNaN(proposalId)) {
        setError('ID Proposal tidak valid');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch proposal detail
        const proposalData = await ProposalService.getById(proposalId);
        if (!proposalData) {
          setError('Proposal tidak ditemukan');
          setLoading(false);
          return;
        }
        
        setProposal(proposalData);
        
        // Untuk mengumpulkan semua data penilaian administrasi dari semua reviewer
        const allAdminByKriteria = new Map<number, ExtendedDetailPenilaianAdministrasi[]>();
        let totalKesalahan = 0;
        let adminResultCount = 0;
        
        if (proposalData.reviewers && proposalData.reviewers.length > 0) {
          for (const reviewer of proposalData.reviewers) {
            if (reviewer.id_user) {
              try {
                const penilaianResult = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
                  reviewer.id_user.toString(),
                  proposalId
                );
                
                if (penilaianResult && penilaianResult.details.length > 0) {
                  adminResultCount++;
                  
                  // Kumpulkan semua detail penilaian per id_kriteria
                  penilaianResult.details.forEach(detail => {
                    const id_kriteria = detail.id_kriteria || 0;
                    
                    if (!allAdminByKriteria.has(id_kriteria)) {
                      allAdminByKriteria.set(id_kriteria, []);
                    }
                    
                    // Simpan catatan dari penilaian pada detail
                    const detailWithCatatan = {
                      ...detail,
                      catatan: penilaianResult.penilaian.catatan || ''
                    } as ExtendedDetailPenilaianAdministrasi;
                    
                    allAdminByKriteria.get(id_kriteria)?.push(detailWithCatatan);
                  });
                }
              } catch (err) {
                console.error('Error fetching penilaian administrasi:', err);
              }
            }
          }
        }
        
        // Konsolidasikan hasil penilaian administrasi - ambil yang kesalahan=true jika ada
        const consolidatedAdminDetails: ExtendedDetailPenilaianAdministrasi[] = [];
        
        for (const [id_kriteria, details] of allAdminByKriteria.entries()) {
          // Cek apakah ada yang kesalahan=true
          const hasError = details.some(detail => detail.kesalahan === true);
          
          // Pilih satu detail untuk ditampilkan (prioritaskan yang kesalahan=true jika ada)
          const selectedDetail = hasError 
            ? details.find(detail => detail.kesalahan === true) 
            : details[0];
          
          if (selectedDetail) {
            consolidatedAdminDetails.push(selectedDetail);
            
            // Tambah ke total kesalahan jika kesalahan=true
            if (selectedDetail.kesalahan === true) {
              totalKesalahan++;
            }
          }
        }
        
        // Urutkan berdasarkan id_kriteria
        const sortedAdminDetails = consolidatedAdminDetails.sort((a, b) => 
          (a.id_kriteria || 0) - (b.id_kriteria || 0)
        );
        
        setPenilaianAdministrasi(sortedAdminDetails);
        setTotalKesalahanAdministrasi(totalKesalahan);
        
        // Untuk penilaian substansi, kumpulkan semua penilaian dari reviewer
        const allSubstansiByKriteria = new Map<number, ExtendedDetailPenilaianSubstansi[]>();
        let totalNilaiSubstansi = 0;
        let substansiResultCount = 0;
        
        // Kumpulkan semua catatan dari semua reviewer dalam Set untuk menghilangkan duplikat
        const uniqueSubstansiCatatan = new Set<string>();
        
        if (proposalData.reviewers && proposalData.reviewers.length > 0) {
          for (const reviewer of proposalData.reviewers) {
            if (reviewer.id_user) {
              try {
                const penilaianResult = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
                  reviewer.id_user.toString(),
                  proposalId
                );
                
                if (penilaianResult && penilaianResult.details.length > 0) {
                  substansiResultCount++;
                  
                  // Update total nilai
                  totalNilaiSubstansi += (penilaianResult.penilaian.total_nilai || 0);
                  
                  // Simpan catatan dari penilaian jika ada
                  if (penilaianResult.penilaian.catatan && penilaianResult.penilaian.catatan.trim() !== '') {
                    uniqueSubstansiCatatan.add(penilaianResult.penilaian.catatan);
                  }
                  
                  // Kumpulkan semua detail penilaian per id_kriteria
                  penilaianResult.details.forEach(detail => {
                    const id_kriteria = detail.id_kriteria || 0;
                    
                    if (!allSubstansiByKriteria.has(id_kriteria)) {
                      allSubstansiByKriteria.set(id_kriteria, []);
                    }
                    
                    allSubstansiByKriteria.get(id_kriteria)?.push(detail as ExtendedDetailPenilaianSubstansi);
                  });
                }
              } catch (err) {
                console.error('Error fetching penilaian substansi:', err);
              }
            }
          }
        }
        
        // Konsolidasikan hasil penilaian substansi - ambil rata-rata nilai
        const consolidatedSubstansiDetails: ExtendedDetailPenilaianSubstansi[] = [];
        
        for (const [id_kriteria, details] of allSubstansiByKriteria.entries()) {
          if (details.length > 0) {
            // Hitung nilai rata-rata
            const totalNilai = details.reduce((sum, detail) => sum + (detail.nilai || 0), 0);
            const avgNilai = totalNilai / details.length;
            
            // Perbaikan perhitungan rata-rata skor
            // Hanya ambil detail yang memiliki skor (tidak null dan tidak undefined)
            const validSkorDetails = details.filter(detail => detail.skor !== null && detail.skor !== undefined);
            let avgSkor = 0;
            
            if (validSkorDetails.length > 0) {
              // Jumlahkan semua skor dan bagi dengan jumlah detail yang memiliki skor
              const totalSkor = validSkorDetails.reduce((sum, detail) => sum + (detail.skor || 0), 0);
              avgSkor = totalSkor / validSkorDetails.length;
              console.log(`Kriteria ID ${id_kriteria}: ${validSkorDetails.length} reviews, total skor ${totalSkor}, avg skor ${avgSkor}`);
            }
            
            // Buat salinan detail pertama dengan nilai dan skor rata-rata
            const consolidatedDetail = {
              ...details[0],
              nilai: parseFloat(avgNilai.toFixed(2)),
              skor: parseFloat(avgSkor.toFixed(2))
            };
            
            // Tambahkan catatan ke salah satu detail saja untuk menandai bahwa ada catatan
            if (uniqueSubstansiCatatan.size > 0) {
              consolidatedDetail.catatan = Array.from(uniqueSubstansiCatatan)[0];
            }
            
            consolidatedSubstansiDetails.push(consolidatedDetail);
          }
        }
        
        // Simpan catatan substansi yang unik ke state
        const sortedSubstansiDetails = consolidatedSubstansiDetails.sort((a, b) => 
          (a.id_kriteria || 0) - (b.id_kriteria || 0)
        );
        
        setPenilaianSubstansi(sortedSubstansiDetails);
        
        // Set catatan unik untuk ditampilkan di UI
        const substansiCatatanArray = Array.from(uniqueSubstansiCatatan);
        if (substansiCatatanArray.length > 0) {
          // Perbarui objek pertama dengan semua catatan
          if (sortedSubstansiDetails.length > 0) {
            sortedSubstansiDetails[0].catatan = substansiCatatanArray[0];
            // Jika ada catatan lain, tambahkan ke detail berikutnya
            for (let i = 1; i < Math.min(substansiCatatanArray.length, sortedSubstansiDetails.length); i++) {
              sortedSubstansiDetails[i].catatan = substansiCatatanArray[i];
            }
          }
        }
        
        // Hitung rata-rata total skor
        if (substansiResultCount > 0) {
          setTotalNilaiSubstansi(parseFloat((totalNilaiSubstansi / substansiResultCount).toFixed(2)));
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId]);

  const handleDownloadReport = async () => {
    if (!proposal) return;

    try {
      setIsDownloading(true);
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Detail Laporan Proposal PKM", 14, 20);
      
      // Subtitle - hanya judul tanpa ID
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${proposal.judul}`, 14, 30);
      
      // Detail proposal sebagai tabel - tanpa ID proposal
      const detailProposalData = [
        ['Judul', proposal.judul || '-'],
        ['Bidang PKM', proposal.bidang_pkm?.nama || '-'],
        ['Pengusul', proposal.mahasiswa?.nama || '-'],
        ['NIM', proposal.mahasiswa?.nim || '-'],
        ['Program Studi', proposal.mahasiswa?.program_studi || '-'],
        ['Jurusan', proposal.mahasiswa?.jurusan || '-'],
        ['Dosen Pembimbing', proposal.dosen?.nama || '-'],
        ['NIDN', proposal.dosen?.nidn || '-'],
        ['Tanggal Pengajuan', format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: id })],
        ['Jumlah Anggota', proposal.jumlah_anggota?.toString() || '0']
      ];
      
      // Tambahkan data pendanaan jika ada
      if (proposal.detail_pendanaan) {
        const danaSimbelmawa = proposal.detail_pendanaan.dana_simbelmawa || 0;
        const danaPT = proposal.detail_pendanaan.dana_perguruan_tinggi || 0;
        const danaPihakLain = proposal.detail_pendanaan.dana_pihak_lain || 0;
        const totalDana = danaSimbelmawa + danaPT + danaPihakLain;
        
        detailProposalData.push(['Dana Simbelmawa', `Rp ${danaSimbelmawa.toLocaleString('id-ID')}`]);
        detailProposalData.push(['Dana Perguruan Tinggi', `Rp ${danaPT.toLocaleString('id-ID')}`]);
        detailProposalData.push(['Dana Pihak Lain', `Rp ${danaPihakLain.toLocaleString('id-ID')}`]);
        detailProposalData.push(['Total Dana', `Rp ${totalDana.toLocaleString('id-ID')}`]);
      }
      
      // Tabel detail proposal
      autoTable(doc, {
        startY: 35,
        body: detailProposalData,
        theme: 'plain',
        styles: { 
          overflow: 'linebreak', 
          cellWidth: 'wrap',
          fontSize: 10
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 }
      });
      
      // 1. Penilaian Administrasi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let startY = (doc as any).lastAutoTable?.finalY + 15 || 150;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Penilaian Administrasi", 14, startY);
      
      if (penilaianAdministrasi.length === 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.text("Belum ada penilaian administrasi untuk proposal ini", 14, startY + 7);
        startY += 15;
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Kesalahan: ${totalKesalahanAdministrasi}`, 14, startY + 7);
        
        // Admin evaluation table
        const adminTableData = penilaianAdministrasi.map((item, index) => {
          return [
            index + 1,
            item.kriteria?.deskripsi || 'Kriteria tidak ditemukan',
            item.kesalahan === true ? "Salah" : "-" // Mengganti tanda ✕ menjadi "Salah" dan tanda ✓ menjadi "-"
          ];
        });
        
        autoTable(doc, {
          startY: startY + 12,
          head: [['No', 'Kriteria', 'Kesalahan']], // Mengubah header dari "Hasil" menjadi "Kesalahan"
          body: adminTableData,
          theme: 'grid',
          headStyles: { fillColor: [66, 135, 245], textColor: 255 },
          styles: { overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, // No
            1: { cellWidth: 'auto' }, // Kriteria
            2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' } // Kesalahan
          },
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
          didDrawPage: function(data) {
            // Tidak perlu tambahkan header di halaman baru
          } as PageHook
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let finalY = (doc as any).lastAutoTable?.finalY + 10 || startY + 20;
        
        // Kumpulkan catatan dari penilaian administrasi (tanpa duplikat)
        // Catatan disimpan dalam penilaian administrasi (bukan per detail)
        const uniqueAdminCatatan = new Set<string>();
        penilaianAdministrasi.forEach(item => {
          if (item.catatan && item.catatan.trim() !== '') {
            uniqueAdminCatatan.add(item.catatan);
          }
        });
        
        if (uniqueAdminCatatan.size > 0) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("Catatan Penilaian Administrasi:", 14, finalY);
          finalY += 7;
          
          // Format catatan
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          
          // Tampilkan setiap catatan secara terpisah
          let yOffset = finalY;
          Array.from(uniqueAdminCatatan).forEach((catatan) => {
            const textLines = doc.splitTextToSize(catatan, 180);
            doc.text(textLines, 14, yOffset);
            yOffset += 5 + (textLines.length * 5);
          });
          
          // Sesuaikan posisi Y untuk teks berikutnya
          finalY = yOffset + 5;
        }
        
        startY = finalY + 10;
      }
      
      // 2. Penilaian Substansi
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Penilaian Substansi", 14, startY);
      
      if (penilaianSubstansi.length === 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.text("Belum ada penilaian substansi untuk proposal ini", 14, startY + 7);
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Nilai: ${totalNilaiSubstansi.toFixed(2)}`, 14, startY + 7);
        
        // Substance evaluation table
        const substansiTableData = penilaianSubstansi.map((item, index) => {
          const bobot = item.kriteria?.bobot || 0;
          const skor = item.skor || 0;
          const nilai = item.nilai || 0;
          
          return [
            index + 1,
            item.kriteria?.deskripsi || 'Kriteria tidak ditemukan',
            bobot.toFixed(2), // Bobot
            skor.toFixed(1), // Skor rata-rata dengan 1 desimal
            nilai.toFixed(2) // Nilai dengan 2 desimal
          ];
        });
        
        // Add total row
        substansiTableData.push([
          '', 
          'Total Nilai', 
          '', 
          '',
          totalNilaiSubstansi.toFixed(2) // Total nilai 
        ]);
        
        autoTable(doc, {
          startY: startY + 12,
          head: [['No', 'Kriteria', 'Bobot', 'Skor', 'Nilai']], 
          body: substansiTableData,
          theme: 'grid',
          headStyles: { fillColor: [66, 135, 245], textColor: 255 },
          styles: { 
            overflow: 'linebreak', 
            cellWidth: 'wrap',
            cellPadding: 2,
            minCellHeight: 10
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, // No
            1: { cellWidth: 'auto', overflow: 'linebreak' }, // Kriteria menggunakan auto width
            2: { cellWidth: 15, halign: 'center' }, // Bobot
            3: { cellWidth: 15, halign: 'center' }, // Skor
            4: { cellWidth: 15, halign: 'right', fontStyle: 'bold' } // Nilai
          },
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
          didDrawPage: function(data) {
            // Tidak perlu tambahkan header di halaman baru
          } as PageHook
        });
        
        // Kumpulkan catatan unik dari penilaian substansi
        const uniqueSubstansiCatatan = new Set<string>();
        penilaianSubstansi.forEach((item: ExtendedDetailPenilaianSubstansi) => {
          if (item.catatan && item.catatan.trim() !== '') {
            uniqueSubstansiCatatan.add(item.catatan);
          }
        });
        
        if (uniqueSubstansiCatatan.size > 0) {
          let finalY = (doc as any).lastAutoTable?.finalY + 10 || startY + 20;
          
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("Catatan Penilaian Substansi:", 14, finalY);
          finalY += 7;
          
          // Format catatan
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          
          // Tampilkan setiap catatan secara terpisah dengan jarak tanpa garis
          let yOffset = finalY;
          Array.from(uniqueSubstansiCatatan).forEach((catatan: string) => {
            const textLines = doc.splitTextToSize(catatan, 180);
            doc.text(textLines, 14, yOffset);
            yOffset += 5 + (textLines.length * 5);
          });
          
          // Sesuaikan posisi Y untuk teks berikutnya
          finalY = yOffset + 5;
        }
      }
      
      // Tambahkan footer dengan nomor halaman
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
      
      // Save PDF dengan nama judul proposal
      const safeFileName = proposal.judul
        .replace(/[^a-z0-9]/gi, '_') // Ganti karakter non-alfanumerik dengan underscore
        .replace(/_+/g, '_') // Ganti multiple underscore dengan satu underscore
        .toLowerCase();
      
      doc.save(`Laporan_${safeFileName}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Gagal mengunduh laporan',
        description: 'Terjadi kesalahan saat mengunduh laporan',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Diterima':
        return 'bg-green-100 text-green-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      case 'Sedang Ditinjau':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => router.push('/admin/report')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Terjadi kesalahan saat memuat laporan.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/report')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <Button 
          onClick={handleDownloadReport}
          className="gap-2"
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
          Unduh Laporan
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {proposal.judul.length > 120 ? `${proposal.judul.substring(0, 80)}...` : proposal.judul}
              </CardTitle>
              <CardDescription className="mt-2">
                Bidang PKM: {proposal.bidang_pkm?.nama || '-'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="detail" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detail">Detail Proposal</TabsTrigger>
              <TabsTrigger value="administrasi">Penilaian Administrasi</TabsTrigger>
              <TabsTrigger value="substansi">Penilaian Substansi</TabsTrigger>
            </TabsList>
            
            {/* Tab Detail Proposal */}
            <TabsContent value="detail" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Informasi Proposal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">ID Proposal</TableCell>
                          <TableCell>{proposal.id_proposal}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Tanggal Pengajuan</TableCell>
                          <TableCell>
                            {format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: id })}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Jumlah Anggota</TableCell>
                          <TableCell>{proposal.jumlah_anggota}</TableCell>
                        </TableRow>
                        {proposal.url_file && (
                          <TableRow>
                            <TableCell className="font-medium">File Proposal</TableCell>
                            <TableCell>
                              <a
                                href={proposal.url_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Download Proposal
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Data Pengusul</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Nama</TableCell>
                            <TableCell>{proposal.mahasiswa?.nama || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">NIM</TableCell>
                            <TableCell>{proposal.mahasiswa?.nim || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Program Studi</TableCell>
                            <TableCell>{proposal.mahasiswa?.program_studi || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Jurusan</TableCell>
                            <TableCell>{proposal.mahasiswa?.jurusan || '-'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Data Dosen Pembimbing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Nama</TableCell>
                            <TableCell>{proposal.dosen?.nama || '-'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">NIDN</TableCell>
                            <TableCell>{proposal.dosen?.nidn || '-'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {proposal.detail_pendanaan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Pendanaan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Dana Simbelmawa</TableCell>
                          <TableCell>
                            Rp {(proposal.detail_pendanaan.dana_simbelmawa || 0).toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dana Perguruan Tinggi</TableCell>
                          <TableCell>
                            Rp {(proposal.detail_pendanaan.dana_perguruan_tinggi || 0).toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dana Pihak Lain</TableCell>
                          <TableCell>
                            Rp {(proposal.detail_pendanaan.dana_pihak_lain || 0).toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Dana</TableCell>
                          <TableCell className="font-semibold">
                            Rp {(
                              (proposal.detail_pendanaan.dana_simbelmawa || 0) +
                              (proposal.detail_pendanaan.dana_perguruan_tinggi || 0) +
                              (proposal.detail_pendanaan.dana_pihak_lain || 0)
                            ).toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Tab Penilaian Administrasi */}
            <TabsContent value="administrasi" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClipboardList className="mr-2 h-5 w-5" />
                      Hasil Penilaian Administrasi
                    </div>
                    <Badge variant={totalKesalahanAdministrasi > 0 ? "destructive" : "success"}>
                      {totalKesalahanAdministrasi} Kesalahan
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {penilaianAdministrasi.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada penilaian administrasi untuk proposal ini
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead>Kriteria</TableHead>
                            <TableHead className="text-center">Kesalahan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {penilaianAdministrasi.map((item, index) => (
                            <TableRow key={item.id_detail_penilaian}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="max-w-md break-words">{item.kriteria?.deskripsi || 'Kriteria tidak ditemukan'}</TableCell>
                              <TableCell className="text-center font-bold">
                                {item.kesalahan === true ? "Salah" : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {/* Tampilkan catatan unik di bawah tabel */}
                      {(() => {
                        const uniqueCatatan = new Set<string>();
                        penilaianAdministrasi.forEach(item => {
                          if (item.catatan && item.catatan.trim() !== '') {
                            uniqueCatatan.add(item.catatan);
                          }
                        });
                        
                        return uniqueCatatan.size > 0 ? (
                          <div className="mt-4 p-4 bg-slate-50 rounded-md">
                            <h4 className="font-medium mb-2">Catatan Penilaian:</h4>
                            <div className="space-y-2">
                              {Array.from(uniqueCatatan).map((catatan, index) => (
                                <p key={index} className="text-sm">{catatan}</p>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tab Penilaian Substansi */}
            <TabsContent value="substansi" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-5 w-5" />
                      Hasil Penilaian Substansi
                    </div>
                    <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Total Nilai: {totalNilaiSubstansi.toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {penilaianSubstansi.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada penilaian substansi untuk proposal ini
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead className="w-1/2">Kriteria</TableHead>
                            <TableHead>Bobot</TableHead>
                            <TableHead className="text-center">Skor</TableHead>
                            <TableHead className="text-right bg-blue-50">Nilai</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {penilaianSubstansi.map((item, index) => {
                            const bobot = item.kriteria?.bobot || 0;
                            const skor = item.skor || 0;
                            const nilai = item.nilai || 0;
                            
                            return (
                              <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="max-w-md break-words whitespace-normal">{item.kriteria?.deskripsi || 'Kriteria tidak ditemukan'}</TableCell>
                                <TableCell>{bobot.toFixed(2)}</TableCell>
                                <TableCell className="text-center">{skor.toFixed(1)}</TableCell>
                                <TableCell className="text-right font-medium bg-blue-50">
                                  {nilai.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow>
                            <TableCell colSpan={4} className="font-bold text-right">
                              Total Nilai:
                            </TableCell>
                            <TableCell className="font-bold text-right bg-blue-50">
                              {totalNilaiSubstansi.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      
                      {/* Tampilkan catatan unik di bawah tabel */}
                      {(() => {
                        const uniqueCatatan = new Set<string>();
                        penilaianSubstansi.forEach(item => {
                          if (item.catatan && item.catatan.trim() !== '') {
                            uniqueCatatan.add(item.catatan);
                          }
                        });
                        
                        return uniqueCatatan.size > 0 ? (
                          <div className="mt-4 p-4 bg-slate-50 rounded-md">
                            <h4 className="font-medium mb-2">Catatan Penilaian:</h4>
                            <div className="space-y-3">
                              {Array.from(uniqueCatatan).map((catatan, index) => (
                                <div key={index}>
                                  <p className="text-sm">{catatan}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
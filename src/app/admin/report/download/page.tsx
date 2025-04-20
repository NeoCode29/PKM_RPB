'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ArrowLeft, 
  Download, 
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProposalService, ProposalWithRelations, BidangPkm } from '@/services/proposal-service';
import { Progress } from '@/components/ui/progress';
import { 
  PenilaianAdministrasiService, 
  DetailPenilaianAdministrasi 
} from '@/services/penilaian-administrasi-service';
import {
  PenilaianSubstansiService,
  DetailPenilaianSubstansi
} from '@/services/penilaian-substansi-service';
import { toast } from '@/components/ui/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Definisi tipe data untuk hasil penilaian
interface AdminData {
  totalKesalahan: number;
  details: DetailPenilaianAdministrasi[];
}

interface SubstansiData {
  totalNilai: number;
  details: DetailPenilaianSubstansi[];
}

interface ProposalDataItem {
  proposal: ProposalWithRelations;
  adminData: AdminData;
  substansiData: SubstansiData;
}

// TypeScript type for detail
interface DetailWithCatatan extends DetailPenilaianAdministrasi {
  catatan?: string;
}

interface DetailSubstansiWithCatatan extends DetailPenilaianSubstansi {
  catatan?: string;
}

export default function DownloadReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [processingZip, setProcessingZip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [bidangList, setBidangList] = useState<BidangPkm[]>([]);
  const [selectedBidang, setSelectedBidang] = useState<string>('all');
  const [progress, setProgress] = useState(0);

  // Fetch proposals and bidang on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch bidang PKM list
        const bidangData = await ProposalService.getAllBidangPkm();
        setBidangList(bidangData);
        
        // Fetch all proposals
        const proposalData = await ProposalService.getAll({
          pageSize: 500 // Ambil lebih banyak proposal
        });
        
        if (proposalData && proposalData.data) {
          setProposals(proposalData.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle generate and download report
  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setProgress(0);
      setError(null);
      
      // Filter proposals by bidang if selected
      let filteredProposals = [...proposals];
      if (selectedBidang !== 'all') {
        filteredProposals = proposals.filter(
          p => p.bidang_pkm?.id_bidang_pkm === parseInt(selectedBidang)
        );
      }
      
      if (filteredProposals.length === 0) {
        setError('Tidak ada proposal yang ditemukan untuk kriteria yang dipilih');
        setGenerating(false);
        return;
      }
      
      // Indicate progress
      setProgress(10);
      
      // Dapatkan semua data penilaian untuk proposal
      const proposalData = await Promise.all(
        filteredProposals.map(async (proposal) => {
          setProgress(prev => Math.min(80, prev + (70 / filteredProposals.length)));
          
          let adminData: AdminData = { totalKesalahan: 0, details: [] };
          let substansiData: SubstansiData = { totalNilai: 0, details: [] };
          
          // Jika proposal memiliki reviewer, ambil data penilaian
          if (proposal.reviewers && proposal.reviewers.length > 0) {
            // Untuk administrasi, ambil yang memiliki kesalahan terbanyak
            let maxKesalahan = 0;
            
            for (const reviewer of proposal.reviewers) {
              if (reviewer.id_user) {
                try {
                  const adminResult = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
                    reviewer.id_user.toString(),
                    proposal.id_proposal
                  );
                  
                  if (adminResult && adminResult.details.length > 0) {
                    const kesalahanCount = adminResult.details.filter(d => d.kesalahan).length;
                    if (kesalahanCount > maxKesalahan) {
                      maxKesalahan = kesalahanCount;
                      adminData = {
                        totalKesalahan: adminResult.penilaian.total_kesalahan || 0,
                        details: adminResult.details
                      };
                    }
                  }
                  
                  // Untuk substansi, ambil rata-rata
                  const substansiResult = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
                    reviewer.id_user.toString(),
                    proposal.id_proposal
                  );
                  
                  if (substansiResult && substansiResult.details.length > 0) {
                    if (substansiData.details.length === 0) {
                      substansiData.details = substansiResult.details;
                      substansiData.totalNilai = substansiResult.penilaian.total_nilai || 0;
                    } else {
                      // Untuk rata-rata nilai substansi
                      substansiData.totalNilai = (substansiData.totalNilai + (substansiResult.penilaian.total_nilai || 0)) / 2;
                    }
                  }
                } catch (err) {
                  console.error(`Error fetching data for proposal ${proposal.id_proposal}:`, err);
                }
              }
            }
          }
          
          return {
            proposal,
            adminData,
            substansiData
          };
        })
      );
      
      // Generate PDF with jsPDF
      setProgress(85);
      
      import('jspdf').then(({ default: jsPDF }) => {
        import('jspdf-autotable').then(({ default: autoTable }) => {
          const doc = new jsPDF();
          
          // Tambahkan judul laporan
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("Laporan Penilaian Proposal", 14, 15);
          
          // Sub judul
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          const bidangText = selectedBidang === 'all' 
            ? 'Semua Bidang' 
            : bidangList.find(b => b.id_bidang_pkm === parseInt(selectedBidang))?.nama || 'Bidang';
          doc.text(`Bidang: ${bidangText}`, 14, 22);
          doc.text(`Jumlah Proposal: ${filteredProposals.length}`, 14, 28);
          doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 34);
          
          // Tabel Ringkasan Proposal
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Ringkasan Proposal", 14, 44);
          
          // Data untuk tabel ringkasan
          const summaryData = proposalData.map((data, index) => [
            index + 1,
            data.proposal.id_proposal,
            data.proposal.judul,
            data.proposal.mahasiswa?.nama || '-',
            data.proposal.bidang_pkm?.nama || '-',
            data.adminData.totalKesalahan,
            data.substansiData.totalNilai.toFixed(2)
          ]);
          
          // Buat tabel ringkasan
          autoTable(doc, {
            startY: 48,
            head: [['No', 'ID', 'Judul Proposal', 'Pengusul', 'Bidang', 'Kesalahan Adm.', 'Nilai Substansi']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [66, 135, 245], textColor: 255 },
            styles: { 
              overflow: 'linebreak', 
              cellWidth: 'wrap',
              fontSize: 10,
              cellPadding: 2
            },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 15, halign: 'center' },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 40 },
              4: { cellWidth: 30 },
              5: { cellWidth: 25, halign: 'center' },
              6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 },
            tableWidth: 'auto'
          });
          
          // Detail setiap proposal
          proposalData.forEach((data, dataIndex) => {
            // Buat halaman baru untuk setiap proposal
            doc.addPage();
            
            const proposal = data.proposal;
            
            // Header proposal
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`Detail Proposal #${dataIndex + 1}`, 14, 15);
            
            // Info proposal
            doc.setFontSize(12);
            doc.text(`${proposal.id_proposal} - ${proposal.judul}`, 14, 22);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Bidang PKM: ${proposal.bidang_pkm?.nama || '-'}`, 14, 28);
            doc.text(`Pengusul: ${proposal.mahasiswa?.nama || '-'}`, 14, 33);
            doc.text(`Status: ${proposal.status_penilaian || 'Belum Dinilai'}`, 14, 38);
            
            // 1. Penilaian Administrasi
            let startY = 48;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("1. Penilaian Administrasi", 14, startY);
            
            if (data.adminData.details.length === 0) {
              doc.setFontSize(10);
              doc.setFont("helvetica", "italic");
              doc.text("Belum ada penilaian administrasi untuk proposal ini", 14, startY + 5);
              startY += 15;
            } else {
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(`Total Kesalahan: ${data.adminData.totalKesalahan}`, 14, startY + 5);
              
              // Tabel Penilaian Administrasi
              const adminTableData = data.adminData.details.map((item, index) => [
                index + 1,
                item.kriteria?.deskripsi || 'Kriteria tidak ditemukan',
                item.kesalahan ? 'Tidak Sesuai' : 'Sesuai'
              ]);
              
              autoTable(doc, {
                startY: startY + 10,
                head: [['No', 'Kriteria', 'Status']],
                body: adminTableData,
                theme: 'grid',
                headStyles: { fillColor: [66, 135, 245], textColor: 255 },
                margin: { left: 14, right: 14 },
                styles: { 
                  overflow: 'linebreak',
                  cellWidth: 'wrap',
                  fontSize: 10,
                  cellPadding: 2
                },
                columnStyles: {
                  0: { cellWidth: 10, halign: 'center' }, // No
                  1: { cellWidth: 'auto' }, // Kriteria
                  2: { cellWidth: 30, halign: 'center' } // Status
                },
                tableWidth: 'auto',
                didDrawPage: function(data) {
                  if (data.pageNumber > 1) {
                    // Menghapus teks lanjutan
                    // doc.setFontSize(12);
                    // doc.setFont("helvetica", "bold");
                    // doc.text("1. Penilaian Administrasi (lanjutan)", 14, 20);
                    // doc.setFont("helvetica", "normal");
                    // doc.setFontSize(10);
                    // doc.text(`Proposal: ${proposal.judul}`, 14, 30);
                  }
                }
              });
            }
            
            // 2. Penilaian Substansi
            startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : startY + 15;
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("2. Penilaian Substansi", 14, startY);
            
            if (data.substansiData.details.length === 0) {
              doc.setFontSize(10);
              doc.setFont("helvetica", "italic");
              doc.text("Belum ada penilaian substansi untuk proposal ini", 14, startY + 5);
            } else {
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(`Total Nilai: ${data.substansiData.totalNilai.toFixed(2)}`, 14, startY + 5);
              
              // Tabel Penilaian Substansi
              const substansiTableData = data.substansiData.details.map((item, index) => [
                index + 1,
                item.kriteria?.deskripsi || 'Kriteria tidak ditemukan',
                item.kriteria?.bobot || '-',
                item.skor ? item.skor.toFixed(1) : '-',
                (item.nilai || 0).toFixed(2)
              ]);
              
              // Tambahkan baris total
              substansiTableData.push(['', 'Total Nilai', '', '', data.substansiData.totalNilai.toFixed(2)]);
              
              autoTable(doc, {
                startY: startY + 10,
                head: [['No', 'Kriteria', 'Bobot', 'Skor', 'Nilai']],
                body: substansiTableData,
                theme: 'grid',
                headStyles: { fillColor: [66, 135, 245], textColor: 255 },
                margin: { left: 14, right: 14 },
                styles: { 
                  overflow: 'linebreak',
                  cellWidth: 'wrap',
                  fontSize: 10,
                  cellPadding: 2,
                  minCellHeight: 10
                },
                columnStyles: {
                  0: { cellWidth: 10, halign: 'center' }, // No
                  1: { cellWidth: 'auto' }, // Kriteria
                  2: { cellWidth: 15, halign: 'center' }, // Bobot
                  3: { cellWidth: 15, halign: 'center' }, // Skor
                  4: { cellWidth: 15, halign: 'right', fontStyle: 'bold' } // Nilai
                },
                tableWidth: 'auto',
                didDrawPage: function(data) {
                  if (data.pageNumber > 1) {
                    // Menghapus teks lanjutan
                    // doc.setFontSize(12);
                    // doc.setFont("helvetica", "bold");
                    // doc.text("2. Penilaian Substansi (lanjutan)", 14, 20);
                    // doc.setFont("helvetica", "normal");
                    // doc.setFontSize(10);
                    // doc.text(`Proposal: ${proposal.judul}`, 14, 30);
                  }
                }
              });
            }
          });
          
          // Footer
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Laporan Penilaian Proposal - Halaman ${i} dari ${pageCount}`, 14, doc.internal.pageSize.height - 10);
            doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
          }
          
          // Indicate progress completion
          setProgress(100);
          
          // Filename
          const bidangName = selectedBidang === 'all' 
            ? 'Semua-Bidang' 
            : bidangList.find(b => b.id_bidang_pkm === parseInt(selectedBidang))?.nama?.replace(/\s+/g, '-') || 'Bidang';
          
          const fileName = `Laporan-Penilaian-Proposal-${bidangName}-${new Date().toISOString().split('T')[0]}.pdf`;
          
          // Save the PDF file
          doc.save(fileName);
          
          setTimeout(() => {
            setGenerating(false);
            setProgress(0);
          }, 1000);
        });
      });
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Gagal membuat laporan. Silakan coba lagi nanti.');
      setGenerating(false);
    }
  };

  // Handle generate individual PDF reports and zip them
  const handleGenerateZipReports = async () => {
    try {
      setProcessingZip(true);
      setProgress(0);
      setError(null);
      
      // Filter proposals by bidang if selected
      let filteredProposals = [...proposals];
      if (selectedBidang !== 'all') {
        filteredProposals = proposals.filter(
          p => p.bidang_pkm?.id_bidang_pkm === parseInt(selectedBidang)
        );
      }
      
      if (filteredProposals.length === 0) {
        setError('Tidak ada proposal yang ditemukan untuk kriteria yang dipilih');
        setProcessingZip(false);
        return;
      }
      
      // Indicate progress
      setProgress(5);
      
      // Dynamically import required libraries
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const zip = new JSZip();
      
      let completedCount = 0;
      
      // Create a promises array for all PDF creations
      const pdfPromises = filteredProposals.map(async (proposal, index) => {
        try {
          // Fetch penilaian data for each proposal
          const adminDetails: DetailWithCatatan[] = [];
          let totalKesalahanAdm = 0;
          const substansiDetails: DetailSubstansiWithCatatan[] = [];
          let totalNilaiSubs = 0;
          
          // Process reviewers if present
          if (proposal.reviewers && proposal.reviewers.length > 0) {
            // For administration evaluations
            const allAdminByKriteria = new Map<number, DetailWithCatatan[]>();
            let adminResultCount = 0;
            
            for (const reviewer of proposal.reviewers) {
              if (reviewer.id_user) {
                try {
                  const penilaianResult = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
                    reviewer.id_user.toString(),
                    proposal.id_proposal
                  );
                  
                  if (penilaianResult && penilaianResult.details.length > 0) {
                    adminResultCount++;
                    
                    // Collect all evaluation details by id_kriteria
                    penilaianResult.details.forEach(detail => {
                      const id_kriteria = detail.id_kriteria || 0;
                      
                      if (!allAdminByKriteria.has(id_kriteria)) {
                        allAdminByKriteria.set(id_kriteria, []);
                      }
                      
                      // Store notes from evaluation on detail
                      const detailWithCatatan: DetailWithCatatan = {
                        ...detail,
                        catatan: penilaianResult.penilaian.catatan || ''
                      };
                      
                      allAdminByKriteria.get(id_kriteria)?.push(detailWithCatatan);
                    });
                  }
                } catch (err) {
                  console.error('Error fetching penilaian administrasi:', err);
                }
              }
            }
            
            // Consolidate administration evaluation results
            for (const [id_kriteria, details] of allAdminByKriteria.entries()) {
              // Check if any evaluation has kesalahan=true
              const hasError = details.some((detail: DetailWithCatatan) => detail.kesalahan === true);
              
              // Select one detail to display (prioritize error=true if exists)
              const selectedDetail = hasError 
                ? details.find((detail: DetailWithCatatan) => detail.kesalahan === true) 
                : details[0];
              
              if (selectedDetail) {
                adminDetails.push(selectedDetail);
                
                // Add to total errors if kesalahan=true
                if (selectedDetail.kesalahan === true) {
                  totalKesalahanAdm++;
                }
              }
            }
            
            // For substance evaluations
            const allSubstansiByKriteria = new Map<number, DetailSubstansiWithCatatan[]>();
            let substansiResultCount = 0;
            
            // Collect all unique notes from all reviewers
            const uniqueSubstansiCatatan = new Set<string>();
            
            for (const reviewer of proposal.reviewers) {
              if (reviewer.id_user) {
                try {
                  const penilaianResult = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
                    reviewer.id_user.toString(), 
                    proposal.id_proposal
                  );
                  
                  if (penilaianResult && penilaianResult.details.length > 0) {
                    substansiResultCount++;
                    
                    // Update total score
                    totalNilaiSubs += (penilaianResult.penilaian.total_nilai || 0);
                    
                    // Save notes from evaluation if present
                    if (penilaianResult.penilaian.catatan && penilaianResult.penilaian.catatan.trim() !== '') {
                      uniqueSubstansiCatatan.add(penilaianResult.penilaian.catatan);
                    }
                    
                    // Collect all details by id_kriteria
                    penilaianResult.details.forEach(detail => {
                      const id_kriteria = detail.id_kriteria || 0;
                      
                      if (!allSubstansiByKriteria.has(id_kriteria)) {
                        allSubstansiByKriteria.set(id_kriteria, []);
                      }
                      
                      const detailWithCatatan: DetailSubstansiWithCatatan = {
                        ...detail,
                        catatan: penilaianResult.penilaian.catatan || ''
                      };
                      
                      allSubstansiByKriteria.get(id_kriteria)?.push(detailWithCatatan);
                    });
                  }
                } catch (err) {
                  console.error('Error fetching penilaian substansi:', err);
                }
              }
            }
            
            // Consolidate substance evaluation results - calculate average values
            for (const [id_kriteria, details] of allSubstansiByKriteria.entries()) {
              if (details.length > 0) {
                // Calculate average score
                const totalNilai = details.reduce((sum: number, detail: DetailSubstansiWithCatatan) => sum + (detail.nilai || 0), 0);
                const avgNilai = totalNilai / details.length;
                
                // Fix average skor calculation
                const validSkorDetails = details.filter((detail: DetailSubstansiWithCatatan) => detail.skor !== null && detail.skor !== undefined);
                let avgSkor = 0;
                
                if (validSkorDetails.length > 0) {
                  const totalSkor = validSkorDetails.reduce((sum: number, detail: DetailSubstansiWithCatatan) => sum + (detail.skor || 0), 0);
                  avgSkor = totalSkor / validSkorDetails.length;
                }
                
                // Create a copy of first detail with average score and nilai
                const consolidatedDetail: DetailSubstansiWithCatatan = {
                  ...details[0],
                  nilai: parseFloat(avgNilai.toFixed(2)),
                  skor: parseFloat(avgSkor.toFixed(2))
                };
                
                substansiDetails.push(consolidatedDetail);
              }
            }
            
            // Calculate average total score
            if (substansiResultCount > 0) {
              totalNilaiSubs = parseFloat((totalNilaiSubs / substansiResultCount).toFixed(2));
            }
            
            // Assign catatan to each substansi detail if available
            const catatanArray = Array.from(uniqueSubstansiCatatan);
            if (catatanArray.length > 0 && substansiDetails.length > 0) {
              // Distribute the catatan to different details if multiple notes available
              for (let i = 0; i < Math.min(catatanArray.length, substansiDetails.length); i++) {
                substansiDetails[i].catatan = catatanArray[i];
              }
            }
          }
          
          // Sort details by id_kriteria
          const sortedAdminDetails = adminDetails.sort((a, b) => 
            (a.id_kriteria || 0) - (b.id_kriteria || 0)
          );
          
          const sortedSubstansiDetails = substansiDetails.sort((a, b) => 
            (a.id_kriteria || 0) - (b.id_kriteria || 0)
          );
          
          // Create individual PDF for this proposal
          const doc = new jsPDF();
          
          // Header
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("Detail Laporan Proposal PKM", 14, 20);
          
          // Subtitle - judul
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text(`${proposal.judul}`, 14, 30);
          
          // Detail proposal sebagai tabel
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
          
          // Tampilkan detail proposal sebagai tabel
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
          let startY = (doc as any).lastAutoTable?.finalY + 15 || 150;
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("1. Penilaian Administrasi", 14, startY);
          
          if (sortedAdminDetails.length === 0) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            doc.text("Belum ada penilaian administrasi untuk proposal ini", 14, startY + 7);
            startY += 15;
          } else {
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Total Kesalahan: ${totalKesalahanAdm}`, 14, startY + 7);
            
            // Admin evaluation table
            const adminTableData = sortedAdminDetails.map((item, index) => {
              return [
                index + 1,
                item.kriteria?.deskripsi || 'Kriteria tidak ditemukan',
                item.kesalahan === true ? "Salah" : "-"
              ];
            });
            
            autoTable(doc, {
              startY: startY + 12,
              head: [['No', 'Kriteria', 'Kesalahan']],
              body: adminTableData,
              theme: 'grid',
              headStyles: { fillColor: [66, 135, 245], textColor: 255 },
              styles: { 
                overflow: 'linebreak', 
                cellWidth: 'wrap'
              },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center' }, // No
                1: { cellWidth: 'auto' }, // Kriteria 
                2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' } // Kesalahan
              },
              margin: { left: 14, right: 14 },
              tableWidth: 'auto',
              didDrawPage: function(data) {
                // Header di halaman baru
                if (data.pageNumber > 1) {
                  // Menghapus teks lanjutan
                  // doc.setFontSize(12);
                  // doc.setFont("helvetica", "bold");
                  // doc.text("1. Penilaian Administrasi (lanjutan)", 14, 20);
                  // doc.setFont("helvetica", "normal");
                  // doc.setFontSize(10);
                  // doc.text(`Proposal: ${proposal.judul}`, 14, 30);
                }
              }
            });
            
            // Collect unique notes for administration evaluations
            const uniqueAdminCatatan = new Set<string>();
            sortedAdminDetails.forEach(item => {
              if (item.catatan && item.catatan.trim() !== '') {
                uniqueAdminCatatan.add(item.catatan);
              }
            });
            
            if (uniqueAdminCatatan.size > 0) {
              let finalY = (doc as any).lastAutoTable?.finalY + 10 || startY + 20;
              doc.setFontSize(11);
              doc.setFont("helvetica", "bold");
              doc.text("Catatan Penilaian Administrasi:", 14, finalY);
              finalY += 7;
              
              // Format notes
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              
              // Display each note separately
              let yOffset = finalY;
              Array.from(uniqueAdminCatatan).forEach((catatan: string) => {
                const textLines = doc.splitTextToSize(catatan, 180);
                doc.text(textLines, 14, yOffset);
                yOffset += 5 + (textLines.length * 5);
              });
              
              // Sesuaikan posisi Y untuk teks berikutnya
              startY = yOffset + 10;
            } else {
              startY = (doc as any).lastAutoTable?.finalY + 15 || startY + 20;
            }
          }
          
          // 2. Penilaian Substansi
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("2. Penilaian Substansi", 14, startY);
          
          if (sortedSubstansiDetails.length === 0) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            doc.text("Belum ada penilaian substansi untuk proposal ini", 14, startY + 7);
          } else {
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Total Nilai: ${totalNilaiSubs.toFixed(2)}`, 14, startY + 7);
            
            // Substance evaluation table
            const substansiTableData = sortedSubstansiDetails.map((item, index) => {
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
              totalNilaiSubs.toFixed(2) // Total nilai 
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
                // Header di halaman baru
                if (data.pageNumber > 1) {
                  // Menghapus teks lanjutan
                  // doc.setFontSize(12);
                  // doc.setFont("helvetica", "bold");
                  // doc.text("2. Penilaian Substansi (lanjutan)", 14, 20);
                  // doc.setFont("helvetica", "normal");
                  // doc.setFontSize(10);
                  // doc.text(`Proposal: ${proposal.judul}`, 14, 30);
                }
              }
            });
            
            // Kumpulkan catatan unik dari penilaian substansi
            const uniqueSubstansiCatatan = new Set<string>();
            sortedSubstansiDetails.forEach(item => {
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
            }
          }
          
          // Tambahkan header dan footer di setiap halaman
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            
            // Tambahkan header jika halaman > 1 (selain halaman pertama)
            if (i > 1) {
              doc.setFontSize(10);
              doc.setFont("helvetica", "bold");
              doc.text(`Detail Laporan Proposal PKM: ${proposal.judul}`, 14, 10);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(8);
              doc.text(`Dicetak pada: ${format(new Date(), "dd MMMM yyyy", { locale: id })}`, doc.internal.pageSize.width - 65, 10);
            }
          }
          
          // Return PDF data and file name
          const pdfBlob = doc.output('blob');
          const safeFileName = proposal.judul
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .toLowerCase();
          
          // Update progress
          completedCount++;
          setProgress(5 + Math.floor((completedCount / filteredProposals.length) * 75));
          
          return {
            blob: pdfBlob,
            fileName: `Laporan_${safeFileName}.pdf`
          };
        } catch (error) {
          console.error(`Error creating PDF for proposal ${proposal.id_proposal}:`, error);
          return null;
        }
      });
      
      // Wait for all PDFs to be created
      const pdfResults = await Promise.all(pdfPromises);
      setProgress(80);
      
      // Add each PDF to the zip file
      pdfResults.forEach(result => {
        if (result) {
          zip.file(result.fileName, result.blob);
        }
      });
      
      // Generate and download the zip file
      setProgress(90);
      const bidangName = selectedBidang === 'all' 
        ? 'Semua-Bidang' 
        : bidangList.find(b => b.id_bidang_pkm === parseInt(selectedBidang))?.nama?.replace(/\s+/g, '-') || 'Bidang';
      
      const zipFileName = `Laporan-Proposal-PKM-${bidangName}-${new Date().toISOString().split('T')[0]}.zip`;
      const zipContent = await zip.generateAsync({ type: 'blob' });
      setProgress(100);
      
      // Save the zip file
      saveAs(zipContent, zipFileName);
      
      toast({
        title: "Berhasil mengunduh laporan",
        description: `${pdfResults.filter(r => r).length} file berhasil diekspor ke ZIP.`,
      });
      
      setTimeout(() => {
        setProcessingZip(false);
        setProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('Error generating zip report:', err);
      setError('Gagal membuat laporan ZIP. Silakan coba lagi nanti.');
      setProcessingZip(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button 
        variant="outline" 
        onClick={() => router.push('/admin/report')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Laporan
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Unduh Laporan Penilaian
          </CardTitle>
          <CardDescription>
            Unduh laporan penilaian proposal dalam format PDF
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-2">Pilih Bidang PKM</h3>
                  <Select 
                    value={selectedBidang}
                    onValueChange={setSelectedBidang}
                    disabled={generating || processingZip}
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Pilih Bidang PKM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Bidang PKM</SelectLabel>
                        <SelectItem value="all">Semua Bidang</SelectItem>
                        {bidangList.map((bidang) => (
                          <SelectItem 
                            key={bidang.id_bidang_pkm} 
                            value={bidang.id_bidang_pkm.toString()}
                          >
                            {bidang.nama}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedBidang !== 'all' && (
                  <div className="text-sm text-muted-foreground">
                    Jumlah proposal: {
                      proposals.filter(p => p.bidang_pkm?.id_bidang_pkm === parseInt(selectedBidang)).length
                    } proposal
                  </div>
                )}
                
                {(generating || processingZip) && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2 w-full" />
                    <p className="text-sm text-muted-foreground">
                      {generating ? 'Menghasilkan laporan...' : 'Mengompres file...'} {progress}%
                    </p>
                  </div>
                )}
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-800">Informasi Laporan</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p>Pilih cara unduh laporan:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Unduh Laporan Ringkasan: Menghasilkan satu file PDF berisi ringkasan semua proposal</li>
                    <li>Unduh Semua Laporan (ZIP): Menghasilkan file ZIP berisi PDF terpisah untuk setiap proposal</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            className="w-full sm:w-auto gap-2"
            onClick={handleGenerateZipReports}
            disabled={loading || generating || processingZip || proposals.length === 0}
          >
            {processingZip ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Unduh Laporan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
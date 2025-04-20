import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PenilaianSubstansiService, DetailPenilaianSubstansiInput, PenilaianSubstansiLengkap } from '@/services/penilaian-substansi-service';
import { KriteriaSubstansiService, KriteriaSubstansi } from '@/services/kriteria-substansi-service';

interface UsePenilaianSubstansiProps {
  proposalId: number;
  bidangId: number;
  userId: string;
}

interface PenilaianItem {
  id_kriteria: number;
  deskripsi: string;
  bobot: number;
  skor: number;
  nilai: number;
}

export function usePenilaianSubstansi({ proposalId, bidangId, userId }: UsePenilaianSubstansiProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [penilaianItems, setPenilaianItems] = useState<PenilaianItem[]>([]);
  const [existingPenilaian, setExistingPenilaian] = useState<PenilaianSubstansiLengkap | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [catatan, setCatatan] = useState('');
  const { toast } = useToast();

  // Fungsi untuk mengambil kriteria dan penilaian yang ada
  const fetchPenilaian = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ambil kriteria substansi berdasarkan bidang
      const kriteriaList = await KriteriaSubstansiService.getByBidangPkm(bidangId);
      
      // Ambil penilaian yang sudah ada (jika ada)
      const existingData = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
        userId,
        proposalId
      );

      setExistingPenilaian(existingData);

      if (existingData && existingData.penilaian.catatan) {
        setCatatan(existingData.penilaian.catatan);
      }

      // Buat map dari detail penilaian yang sudah ada untuk lookup yang lebih cepat
      const existingDetailsMap = new Map(
        existingData?.details.map(detail => [detail.id_kriteria, detail]) || []
      );

      // Inisialisasi penilaian items
      const items = kriteriaList.map((kriteria: KriteriaSubstansi) => {
        const existingDetail = existingDetailsMap.get(kriteria.id_kriteria);
        return {
          id_kriteria: kriteria.id_kriteria,
          deskripsi: kriteria.deskripsi || '',
          bobot: kriteria.bobot || 0,
          skor: existingDetail?.skor || 0,
          nilai: existingDetail?.nilai || 0
        };
      });

      setPenilaianItems(items);
    } catch (err) {
      console.error('Error fetching penilaian:', err);
      setError('Terjadi kesalahan saat memuat data penilaian');
      toast({
        title: 'Error',
        description: 'Gagal memuat data penilaian',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPenilaian();
  }, [proposalId, bidangId, userId]);

  // Fungsi untuk menghitung nilai berdasarkan skor dan bobot
  const calculateNilai = (skor: number, bobot: number) => {
    return Math.round(skor * bobot);
  };

  // Fungsi untuk mengupdate skor
  const updateSkor = (id_kriteria: number, skor: number) => {
    setPenilaianItems(prevItems =>
      prevItems.map(item => {
        if (item.id_kriteria === id_kriteria) {
          const nilai = calculateNilai(skor, item.bobot);
          return { ...item, skor, nilai };
        }
        return item;
      })
    );
  };

  // Fungsi untuk menyimpan penilaian
  const savePenilaian = async (isFinalized: boolean, catatanValue: string) => {
    try {
      setIsSaving(true);
      setError(null);

      const details: DetailPenilaianSubstansiInput[] = penilaianItems.map(item => ({
        id_kriteria: item.id_kriteria,
        skor: item.skor,
        nilai: item.nilai
      }));

      // Validasi skor tidak boleh 0 saat finalisasi
      if (isFinalized) {
        const invalidItems = penilaianItems.filter(item => item.skor === 0);
        if (invalidItems.length > 0) {
          throw new Error('Semua kriteria harus diberi skor untuk menyimpan penilaian');
        }
      }

      // Pastikan catatan selalu terkirim
      console.log("Saving with catatan:", catatanValue);

      if (existingPenilaian) {
        // Update penilaian yang sudah ada
        await PenilaianSubstansiService.updatePenilaian(existingPenilaian.penilaian.id, {
          id_reviewer: userId,
          id_proposal: proposalId,
          details,
          isFinalized,
          catatan: catatanValue
        });
      } else {
        // Buat penilaian baru
        await PenilaianSubstansiService.createPenilaian({
          id_reviewer: userId,
          id_proposal: proposalId,
          details,
          isFinalized,
          catatan: catatanValue
        });
      }

      toast({
        title: 'Sukses',
        description: 'Penilaian berhasil disimpan',
      });

      // Refresh data
      await fetchPenilaian();
    } catch (err) {
      console.error('Error saving penilaian:', err);
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan penilaian';
      setError(errMsg);
      toast({
        title: 'Error',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    error,
    penilaianItems,
    existingPenilaian,
    isSaving,
    updateSkor,
    savePenilaian,
    refreshPenilaian: fetchPenilaian,
    catatan,
    setCatatan
  };
} 
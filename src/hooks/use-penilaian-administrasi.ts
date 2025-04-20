import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  PenilaianAdministrasiService, 
  PenilaianAdministrasiLengkap,
  DetailPenilaianAdministrasi,
  DetailPenilaianAdministrasiInput
} from '@/services/penilaian-administrasi-service';
import { KriteriaAdministrasi, KriteriaAdministrasiService } from '@/services/kriteria-administrasi-service';
import { PenilaianAdministrasi, PenilaianAdministrasiInput } from '@/services/penilaian-administrasi-service';
import { useRouter } from 'next/navigation';
import { ProposalService, ProposalWithRelations } from '@/services/proposal-service';
import { PenilaianSubstansiService } from '@/services/penilaian-substansi-service';

// Interface untuk item penilaian internal
interface PenilaianItem {
  id_kriteria: number;
  kesalahan: boolean;
}

// Hook untuk mendapatkan daftar proposal per bidang PKM
export const usePenilaianBidang = (userId: string) => {
  const [bidangList, setBidangList] = useState<Array<{id_bidang_pkm: number, nama: string, count: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchBidangList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PenilaianAdministrasiService.getProposalCountByBidang(userId);
      setBidangList(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data bidang'));
      toast({
        title: 'Error',
        description: 'Gagal memuat data bidang PKM',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (userId) {
      fetchBidangList();
    }
  }, [userId, fetchBidangList]);

  return {
    bidangList,
    loading,
    error,
    refreshBidangList: fetchBidangList
  };
};

// Hook untuk mendapatkan proposal dalam satu bidang PKM
export function useBidangProposals(userId: string, bidangId: number) {
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validasi userId yang lebih ketat
      if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
        throw new Error('Sesi telah berakhir. Silakan login kembali.');
      }

      // Validasi bidangId
      if (!bidangId || isNaN(bidangId)) {
        throw new Error('ID bidang PKM tidak valid.');
      }

      // Ambil data proposal
      const result = await ProposalService.getAll({
        bidang_pkm_id: bidangId
      });

      if (!result || !result.data) {
        throw new Error('Gagal memuat data proposal.');
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Format data proposal tidak valid.');
      }

      // Filter proposal yang ditugaskan ke reviewer ini
      const filteredProposals = result.data.filter(proposal => 
        proposal.reviewers?.some(reviewer => reviewer.id_user === userId)
      );

      // Ambil data penilaian administrasi untuk setiap proposal
      const proposalsWithPenilaian = await Promise.all(
        filteredProposals.map(async (proposal: ProposalWithRelations) => {
          try {
            const penilaianAdm = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
              userId,
              proposal.id_proposal
            );

            // Tambahkan juga penilaian substansi
            const penilaianSub = await PenilaianSubstansiService.getPenilaianByReviewerAndProposal(
              userId,
              proposal.id_proposal
            );

            return {
              ...proposal,
              penilaian_administrasi: penilaianAdm ? penilaianAdm.penilaian : null,
              penilaian_substansi: penilaianSub ? penilaianSub.penilaian : null
            };
          } catch (err) {
            console.error(`Error fetching penilaian for proposal ${proposal.id_proposal}:`, err);
            // Tetap kembalikan proposal meski tanpa penilaian
            return {
              ...proposal,
              penilaian_administrasi: null,
              penilaian_substansi: null
            };
          }
        })
      );

      setProposals(proposalsWithPenilaian);
      setError(null);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat memuat data.'));
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [userId, bidangId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
          setLoading(false);
          setError(new Error('Sesi telah berakhir. Silakan login kembali.'));
          setProposals([]);
          return;
        }

        if (isMounted) {
          await fetchProposals();
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading proposals:', err);
          setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat memuat data.'));
          setProposals([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId, fetchProposals]);

  const refreshProposals = useCallback(async () => {
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      setError(new Error('Sesi telah berakhir. Silakan login kembali.'));
      return;
    }
    await fetchProposals();
  }, [userId, fetchProposals]);

  return {
    proposals,
    loading,
    error,
    refreshProposals
  };
}

// Hook untuk mengelola penilaian administrasi
export const usePenilaianAdministrasi = (userId: string, proposalId: number) => {
  const [penilaian, setPenilaian] = useState<PenilaianAdministrasiLengkap | null>(null);
  const [kriteria, setKriteria] = useState<KriteriaAdministrasi[]>([]);
  const [penilaianItems, setPenilaianItems] = useState<PenilaianItem[]>([]);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Ambil semua kriteria administrasi
  const fetchKriteria = useCallback(async () => {
    try {
      // Validasi parameter
      if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
        throw new Error('ID pengguna tidak valid');
      }

      if (!proposalId || isNaN(proposalId)) {
        throw new Error('ID proposal tidak valid');
      }

      const data = await KriteriaAdministrasiService.getAll();
      if (!data || !Array.isArray(data)) {
        throw new Error('Data kriteria tidak valid');
      }

      setKriteria(data);
      
      // Initialize penilaianItems dengan semua kriteria (default: tidak ada kesalahan)
      setPenilaianItems(data.map(k => ({
        id_kriteria: k.id_kriteria,
        kesalahan: false
      })));

      setError(null);
    } catch (err) {
      console.error('Error fetching kriteria:', err);
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data kriteria'));
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  }, [userId, proposalId, toast]);

  // Ambil penilaian yang sudah ada (jika ada)
  const fetchPenilaian = useCallback(async () => {
    if (!userId || !proposalId) {
      console.error('Missing required parameters:', { userId, proposalId });
      return;
    }

    try {
      setLoading(true);
      
      // Validasi userId
      if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
        throw new Error('ID pengguna tidak valid');
      }

      // Validasi proposalId
      if (!proposalId || isNaN(proposalId)) {
        throw new Error('ID proposal tidak valid');
      }
      
      // Panggil service untuk mendapatkan penilaian yang sudah ada
      const data = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
        userId, 
        proposalId
      );
      
      if (data) {
        setPenilaian(data);
        setCatatan(data.penilaian.catatan || '');
        
        // Buat map untuk memudahkan pencarian
        const existingDetailsMap = new Map(
          data.details.map(detail => [detail.id_kriteria, detail])
        );
        
        // Update penilaianItems dengan data yang ada
        setPenilaianItems(prevItems => 
          prevItems.map(item => ({
            id_kriteria: item.id_kriteria,
            kesalahan: existingDetailsMap.get(item.id_kriteria)?.kesalahan ?? false
          }))
        );
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching penilaian:', err);
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data penilaian'));
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, proposalId, toast]);

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Validasi parameter
        if (!userId || !proposalId) {
          throw new Error('Parameter tidak lengkap');
        }

        // Fetch data secara berurutan
        await fetchKriteria();
        if (isMounted) {
          await fetchPenilaian();
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error initializing data:', err);
          setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat memuat data'));
          toast({
            title: 'Error',
            description: 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [userId, proposalId, fetchKriteria, fetchPenilaian, toast]);

  // Handle perubahan checkbox penilaian
  const handleToggleKesalahan = useCallback((id_kriteria: number, checked: boolean) => {
    setPenilaianItems(prev => 
      prev.map(item => 
        item.id_kriteria === id_kriteria 
          ? { ...item, kesalahan: checked } 
          : item
      )
    );
  }, []);

  // Handle perubahan catatan
  const handleCatatanChange = useCallback((value: string) => {
    setCatatan(value);
  }, []);

  // Handle submit penilaian
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validasi userId
      if (!userId || userId === 'undefined' || userId === 'null') {
        throw new Error('ID pengguna tidak valid');
      }
      
      // Cek apakah penilaian sudah ada
      const existingPenilaian = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
        userId,
        proposalId
      );
      
      const input: PenilaianAdministrasiInput = {
        id_reviewer: userId, // userId sudah dalam bentuk string UUID
        id_proposal: proposalId,
        details: penilaianItems,
        isFinalized: true,
        catatan: catatan
      };
      
      if (existingPenilaian) {
        // Update penilaian yang sudah ada
        await PenilaianAdministrasiService.updatePenilaian(
          existingPenilaian.penilaian.id_penilaian_administrasi,
          input
        );
        toast({
          title: "Sukses",
          description: "Penilaian berhasil diperbarui"
        });
      } else {
        try {
          // Buat penilaian baru
          await PenilaianAdministrasiService.createPenilaian(input);
          toast({
            title: "Sukses",
            description: "Penilaian berhasil disimpan"
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('Penilaian sudah ada')) {
            // Jika penilaian ternyata sudah ada, update saja
            const latestPenilaian = await PenilaianAdministrasiService.getPenilaianByReviewerAndProposal(
              userId,
              proposalId
            );
            if (latestPenilaian) {
              await PenilaianAdministrasiService.updatePenilaian(
                latestPenilaian.penilaian.id_penilaian_administrasi,
                input
              );
              toast({
                title: "Sukses",
                description: "Penilaian berhasil diperbarui"
              });
            }
          } else {
            throw error;
          }
        }
      }
      
      // Refresh data setelah submit
      await fetchPenilaian();
      router.refresh();
    } catch (error) {
      console.error('Error saving penilaian:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan penilaian",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    penilaian,
    kriteria,
    penilaianItems,
    catatan,
    loading,
    submitting,
    error,
    handleToggleKesalahan,
    handleCatatanChange,
    handleSubmit,
    refreshPenilaian: fetchPenilaian
  };
}; 
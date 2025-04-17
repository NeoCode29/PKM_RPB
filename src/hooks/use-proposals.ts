"use client"

import { useState, useEffect, useCallback } from 'react';
import {
  ProposalService,
  ProposalWithRelations,
  ProposalInput,
  ProposalFilter,
  Mahasiswa,
  Dosen,
  User,
  BidangPkm,
  PaginatedResult
} from '@/services/proposal-service';
import { useToast } from '@/components/ui/use-toast';

// Hook untuk mengelola daftar proposal
export const useProposals = (initialFilter: ProposalFilter = {}) => {
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [filter, setFilter] = useState<ProposalFilter>({
    ...initialFilter,
    page: initialFilter.page || 1,
    pageSize: initialFilter.pageSize || 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: filter.page || 1,
    pageSize: filter.pageSize || 10,
    count: 0,
    totalPages: 0
  });
  
  // Data untuk dropdown options
  const [mahasiswaOptions, setMahasiswaOptions] = useState<Mahasiswa[]>([]);
  const [dosenOptions, setDosenOptions] = useState<Dosen[]>([]);
  const [reviewerOptions, setReviewerOptions] = useState<User[]>([]);
  const [bidangOptions, setBidangOptions] = useState<BidangPkm[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const { toast } = useToast();

  // Fungsi untuk memuat proposal dengan filter
  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ProposalService.getAll(filter);
      setProposals(result.data);
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        count: result.count,
        totalPages: result.totalPages
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar proposal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  // Fungsi untuk memuat opsi-opsi untuk dropdown
  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const bidang = await ProposalService.getAllBidangPkm();
      const reviewers = await ProposalService.getAvailableReviewers();
      
      setBidangOptions(bidang);
      setReviewerOptions(reviewers);
    } catch (err) {
      console.error('Error fetching options:', err);
      toast({
        title: 'Error',
        description: 'Gagal memuat opsi dropdown',
        variant: 'destructive',
      });
    } finally {
      setLoadingOptions(false);
    }
  }, [toast]);

  // Fungsi untuk memperbarui filter
  const updateFilter = useCallback((newFilter: Partial<ProposalFilter>) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      ...newFilter,
    }));
  }, []);

  // Fungsi untuk membuat proposal baru
  const createProposal = useCallback(async (data: ProposalInput) => {
    try {
      setLoading(true);
      const newProposal = await ProposalService.create(data);
      setProposals(prev => [newProposal, ...prev]);
      toast({
        title: 'Sukses',
        description: 'Proposal berhasil dibuat',
      });
      return newProposal;
    } catch (err) {
      console.error('Error creating proposal:', err);
      toast({
        title: 'Error',
        description: 'Gagal membuat proposal',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fungsi untuk memperbarui proposal
  const updateProposal = useCallback(async (id: number, data: Partial<ProposalInput>) => {
    try {
      setLoading(true);
      // Simpan perubahan proposal
      await ProposalService.update(id, data);
      
      // Ambil data terbaru dari server untuk memastikan semua relasi termasuk reviewer terupdate
      const freshData = await ProposalService.getById(id);
      // Pastikan freshData tidak null sebelum memperbarui state
      if (freshData) {
        setProposals(prev => 
          prev.map(item => item.id_proposal === id ? freshData as ProposalWithRelations : item)
        );
      }
      
      toast({
        title: 'Sukses',
        description: 'Proposal berhasil diperbarui',
      });
      return freshData;
    } catch (err) {
      console.error('Error updating proposal:', err);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui proposal',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fungsi untuk menghapus proposal
  const deleteProposal = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await ProposalService.delete(id);
      setProposals(prev => prev.filter(item => item.id_proposal !== id));
      toast({
        title: 'Sukses',
        description: 'Proposal berhasil dihapus',
      });
      return true;
    } catch (err) {
      console.error('Error deleting proposal:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus proposal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fungsi untuk mengimpor proposal dari file spreadsheet
  const importProposals = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const count = await ProposalService.importFromSpreadsheet(file);
      if (count > 0) {
        // Muat ulang proposal setelah impor
        await fetchProposals();
        toast({
          title: 'Sukses',
          description: `${count} proposal berhasil diimpor`,
        });
      } else {
        toast({
          title: 'Info',
          description: 'Tidak ada proposal yang diimpor',
        });
      }
      return count;
    } catch (err) {
      console.error('Error importing proposals:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengimpor proposal',
        variant: 'destructive',
      });
      return 0;
    } finally {
      setLoading(false);
    }
  }, [fetchProposals, toast]);

  // Fungsi untuk mengekspor proposal ke file Excel
  const exportProposals = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await ProposalService.exportToExcel(proposals);
      // Buat link untuk download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Sukses',
        description: 'Proposal berhasil diekspor',
      });
    } catch (err) {
      console.error('Error exporting proposals:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengekspor proposal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [proposals, toast]);

  // Fungsi untuk mengunduh template impor
  const downloadImportTemplate = useCallback(async () => {
    try {
      const blob = await ProposalService.createImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-import-proposal.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Sukses',
        description: 'Template berhasil diunduh',
      });
    } catch (err) {
      console.error('Error downloading template:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengunduh template',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fungsi untuk berpindah halaman
  const changePage = useCallback((newPage: number) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      page: newPage
    }));
  }, []);
  
  // Fungsi untuk mengubah ukuran halaman
  const changePageSize = useCallback((newPageSize: number) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      page: 1, // Reset ke halaman pertama saat mengubah ukuran
      pageSize: newPageSize
    }));
  }, []);

  // Memuat proposal saat filter berubah
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Memuat opsi dropdown saat komponen dimount
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    proposals,
    loading,
    error,
    filter,
    pagination,
    updateFilter,
    changePage,
    changePageSize,
    fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal,
    importProposals,
    exportProposals,
    downloadImportTemplate,
    options: {
      bidang: bidangOptions,
      reviewers: reviewerOptions,
      loadingOptions,
    },
  };
};

// Hook untuk mengelola detail proposal
export const useProposalDetail = (id: number) => {
  const [proposal, setProposal] = useState<ProposalWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fungsi untuk memuat detail proposal
  const fetchProposal = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProposalService.getById(id);
      setProposal(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Gagal memuat detail proposal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  // Fungsi untuk memperbarui proposal
  const updateProposal = useCallback(async (data: Partial<ProposalInput>) => {
    try {
      setLoading(true);
      // Simpan perubahan proposal
      await ProposalService.update(id, data);
      
      // Ambil data terbaru dari server untuk memastikan semua relasi termasuk reviewer terupdate
      const freshData = await ProposalService.getById(id);
      setProposal(freshData);
      
      toast({
        title: 'Sukses',
        description: 'Proposal berhasil diperbarui',
      });
      return freshData;
    } catch (err) {
      console.error('Error updating proposal:', err);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui proposal',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  // Memuat proposal saat komponen dimount atau ID berubah
  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id, fetchProposal]);

  return {
    proposal,
    loading,
    error,
    updateProposal,
    refreshProposal: fetchProposal,
  };
}; 
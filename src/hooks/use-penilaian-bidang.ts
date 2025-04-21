"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PenilaianAdministrasiService } from '@/services/penilaian-administrasi-service';

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
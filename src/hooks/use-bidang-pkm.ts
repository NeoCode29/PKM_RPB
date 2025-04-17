import { useState, useEffect, useCallback } from 'react';
import { BidangPkmService, BidangPkm } from '@/services/bidang-pkm-service';

export const useBidangPkm = () => {
  const [bidangPkm, setBidangPkm] = useState<BidangPkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBidangPkm = useCallback(async () => {
    try {
      setLoading(true);
      const data = await BidangPkmService.getAll();
      setBidangPkm(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data bidang PKM'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBidangPkm();
  }, [fetchBidangPkm]);

  return {
    bidangPkm,
    loading,
    error,
    refreshBidangPkm: fetchBidangPkm
  };
}; 
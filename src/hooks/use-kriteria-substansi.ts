import { useState, useEffect, useCallback } from 'react';
import { 
  KriteriaSubstansiService, 
  KriteriaSubstansi, 
  KriteriaSubstansiInput 
} from '@/services/kriteria-substansi-service';

export const useKriteriaSubstansi = (bidangPkmId: number | null) => {
  const [kriteria, setKriteria] = useState<KriteriaSubstansi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKriteria = useCallback(async () => {
    if (bidangPkmId === null) {
      setKriteria([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await KriteriaSubstansiService.getByBidangPkm(bidangPkmId);
      setKriteria(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data kriteria'));
    } finally {
      setLoading(false);
    }
  }, [bidangPkmId]);

  useEffect(() => {
    fetchKriteria();
  }, [fetchKriteria]);

  const createKriteria = useCallback(async (input: Omit<KriteriaSubstansiInput, 'id_bidang_pkm'>) => {
    if (bidangPkmId === null) {
      throw new Error('Bidang PKM harus dipilih');
    }

    try {
      setLoading(true);
      const created = await KriteriaSubstansiService.create({
        id_bidang_pkm: bidangPkmId,
        ...input
      });
      setKriteria(prev => [...prev, created]);
      return created;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Terjadi kesalahan saat membuat kriteria');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [bidangPkmId]);

  const updateKriteria = useCallback(async (id: number, input: Omit<KriteriaSubstansiInput, 'id_bidang_pkm'>) => {
    if (bidangPkmId === null) {
      throw new Error('Bidang PKM harus dipilih');
    }

    try {
      setLoading(true);
      const updated = await KriteriaSubstansiService.update(id, {
        id_bidang_pkm: bidangPkmId,
        ...input
      });
      setKriteria(prev => prev.map(item => item.id_kriteria === id ? updated : item));
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Terjadi kesalahan saat memperbarui kriteria');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [bidangPkmId]);

  const deleteKriteria = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await KriteriaSubstansiService.delete(id);
      setKriteria(prev => prev.filter(item => item.id_kriteria !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Terjadi kesalahan saat menghapus kriteria');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    kriteria,
    loading,
    error,
    createKriteria,
    updateKriteria,
    deleteKriteria,
    refreshKriteria: fetchKriteria
  };
};

export const useKriteriaSubstansiDetail = (id: number | null) => {
  const [kriteriaDetail, setKriteriaDetail] = useState<KriteriaSubstansi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchKriteriaDetail = useCallback(async () => {
    if (id === null) {
      setKriteriaDetail(null);
      return;
    }
    
    try {
      setLoading(true);
      const data = await KriteriaSubstansiService.getById(id);
      setKriteriaDetail(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil detail kriteria'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKriteriaDetail();
  }, [fetchKriteriaDetail]);

  return {
    kriteriaDetail,
    loading,
    error,
    refreshKriteriaDetail: fetchKriteriaDetail
  };
}; 
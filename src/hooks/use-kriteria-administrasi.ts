import { useState, useEffect, useCallback } from 'react';
import { 
  KriteriaAdministrasiService, 
  KriteriaAdministrasi, 
  KriteriaAdministrasiInput 
} from '@/services/kriteria-administrasi-service';

export const useKriteriaAdministrasi = () => {
  const [kriteria, setKriteria] = useState<KriteriaAdministrasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKriteria = useCallback(async () => {
    try {
      setLoading(true);
      const data = await KriteriaAdministrasiService.getAll();
      setKriteria(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data kriteria'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKriteria();
  }, [fetchKriteria]);

  const createKriteria = useCallback(async (input: KriteriaAdministrasiInput) => {
    try {
      setLoading(true);
      const created = await KriteriaAdministrasiService.create(input);
      setKriteria(prev => [...prev, created]);
      return created;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Terjadi kesalahan saat membuat kriteria');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateKriteria = useCallback(async (id: number, input: KriteriaAdministrasiInput) => {
    try {
      setLoading(true);
      const updated = await KriteriaAdministrasiService.update(id, input);
      setKriteria(prev => prev.map(item => item.id_kriteria === id ? updated : item));
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Terjadi kesalahan saat memperbarui kriteria');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteKriteria = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await KriteriaAdministrasiService.delete(id);
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

export const useKriteriaAdministrasiDetail = (id: number | null) => {
  const [kriteriaDetail, setKriteriaDetail] = useState<KriteriaAdministrasi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchKriteriaDetail = useCallback(async () => {
    if (id === null) {
      setKriteriaDetail(null);
      return;
    }
    
    try {
      setLoading(true);
      const data = await KriteriaAdministrasiService.getById(id);
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
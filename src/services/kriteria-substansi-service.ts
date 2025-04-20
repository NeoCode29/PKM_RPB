import { supabaseClient } from '@/lib/supabase/client';

export interface KriteriaSubstansi {
  id_kriteria: number;
  created_at: string;
  id_bidang_pkm: number | null;
  deskripsi: string | null;
  bobot: number | null;
}

export interface KriteriaSubstansiInput {
  id_bidang_pkm: number;
  deskripsi: string;
  bobot: number;
}

export const KriteriaSubstansiService = {
  async getAll(): Promise<KriteriaSubstansi[]> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_substansi')
      .select('*')
      .order('id_kriteria', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaSubstansi[];
  },
  
  async getByBidangPkm(bidangPkmId: number): Promise<KriteriaSubstansi[]> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_substansi')
      .select('*')
      .eq('id_bidang_pkm', bidangPkmId)
      .order('id_kriteria', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaSubstansi[];
  },
  
  async getById(id: number): Promise<KriteriaSubstansi | null> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_substansi')
      .select('*')
      .eq('id_kriteria', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaSubstansi;
  },
  
  async create(kriteria: KriteriaSubstansiInput): Promise<KriteriaSubstansi> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_substansi')
      .insert([kriteria])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaSubstansi;
  },
  
  async update(id: number, kriteria: KriteriaSubstansiInput): Promise<KriteriaSubstansi> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_substansi')
      .update(kriteria)
      .eq('id_kriteria', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaSubstansi;
  },
  
  async delete(id: number): Promise<void> {
    const supabase = supabaseClient();
    
    const { error } = await supabase
      .from('kriteria_substansi')
      .delete()
      .eq('id_kriteria', id);
    
    if (error) {
      throw error;
    }
  }
}; 
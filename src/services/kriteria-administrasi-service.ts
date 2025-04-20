import { supabaseClient } from '@/lib/supabase/client';

export interface KriteriaAdministrasi {
  id_kriteria: number;
  created_at: string;
  deskripsi: string | null;
}

export interface KriteriaAdministrasiInput {
  deskripsi: string;
}

export const KriteriaAdministrasiService = {
  async getAll(): Promise<KriteriaAdministrasi[]> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_administrasi')
      .select('*')
      .order('id_kriteria', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaAdministrasi[];
  },
  
  async getById(id: number): Promise<KriteriaAdministrasi | null> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_administrasi')
      .select('*')
      .eq('id_kriteria', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaAdministrasi;
  },
  
  async create(kriteria: KriteriaAdministrasiInput): Promise<KriteriaAdministrasi> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_administrasi')
      .insert([kriteria])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaAdministrasi;
  },
  
  async update(id: number, kriteria: KriteriaAdministrasiInput): Promise<KriteriaAdministrasi> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('kriteria_administrasi')
      .update(kriteria)
      .eq('id_kriteria', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as KriteriaAdministrasi;
  },
  
  async delete(id: number): Promise<void> {
    const supabase = supabaseClient();
    
    const { error } = await supabase
      .from('kriteria_administrasi')
      .delete()
      .eq('id_kriteria', id);
    
    if (error) {
      throw error;
    }
  }
}; 
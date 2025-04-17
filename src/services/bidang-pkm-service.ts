import { supabaseClient } from '@/lib/supabase/client';

export interface BidangPkm {
  id_bidang_pkm: number;
  nama: string | null;
  created_at: string;
}

export const BidangPkmService = {
  async getAll(): Promise<BidangPkm[]> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('bidang_pkm')
      .select('*')
      .order('id_bidang_pkm', { ascending: true });
    
    if (error) {
      console.error('Error fetching bidang PKM:', error);
      throw error;
    }
    
    return data as BidangPkm[];
  },

  async getById(id: number): Promise<BidangPkm | null> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('bidang_pkm')
      .select('*')
      .eq('id_bidang_pkm', id)
      .single();
    
    if (error) {
      console.error('Error fetching bidang PKM by id:', error);
      throw error;
    }
    
    return data as BidangPkm;
  }
}; 
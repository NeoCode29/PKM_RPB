import { supabaseClient } from '@/lib/supabase/client';
import { KriteriaSubstansi } from './kriteria-substansi-service';

export interface PenilaianSubstansi {
  id: number;
  created_at: string;
  id_reviewer: number;
  total_nilai: number | null;
  status: boolean | null;
  updated_at: string | null;
  catatan: string | null;
}

export interface DetailPenilaianSubstansi {
  id: number;
  created_at: string;
  id_penilaian: number;
  id_kriteria: number;
  skor: number | null;
  nilai: number | null;
  kriteria?: KriteriaSubstansi;
}

export interface DetailPenilaianSubstansiInput {
  id_kriteria: number;
  skor: number;
  nilai: number;
}

export interface PenilaianSubstansiInput {
  id_reviewer: string;
  id_proposal: number;
  details: DetailPenilaianSubstansiInput[];
  isFinalized?: boolean;
  catatan?: string;
}

export interface PenilaianSubstansiLengkap {
  penilaian: PenilaianSubstansi;
  details: DetailPenilaianSubstansi[];
}

export const PenilaianSubstansiService = {
  // Mendapatkan penilaian substansi berdasarkan id_reviewer dan id_proposal
  async getPenilaianByReviewerAndProposal(
    id_reviewer: string,
    id_proposal: number
  ): Promise<PenilaianSubstansiLengkap | null> {
    const supabase = supabaseClient();
    
    try {
      // Cari reviewer untuk mendapatkan id_reviewer
      const { data: reviewerData, error: reviewerError } = await supabase
        .from('reviewer')
        .select('id_reviewer')
        .eq('id_proposal', id_proposal)
        .eq('id_user', id_reviewer)
        .single();
      
      if (reviewerError || !reviewerData) {
        console.log('No reviewer found');
        return null;
      }
      
      // Cari penilaian substansi
      const { data: penilaianData, error: penilaianError } = await supabase
        .from('penilaian_substansi')
        .select('*')
        .eq('id_reviewer', reviewerData.id_reviewer)
        .single();
      
      if (penilaianError || !penilaianData) {
        console.log('No penilaian substansi found');
        return null;
      }
      
      // Cari detail penilaian substansi
      const { data: detailData, error: detailError } = await supabase
        .from('detail_penilaian_substansi')
        .select(`
          *,
          kriteria:id_kriteria (
            id_kriteria,
            deskripsi,
            bobot,
            id_bidang_pkm
          )
        `)
        .eq('id_penilaian', penilaianData.id);
      
      if (detailError) {
        throw detailError;
      }
      
      return {
        penilaian: penilaianData,
        details: detailData || []
      };
    } catch (error) {
      console.error('Error in getPenilaianByReviewerAndProposal:', error);
      return null;
    }
  },

  // Membuat penilaian substansi baru
  async createPenilaian(input: PenilaianSubstansiInput): Promise<PenilaianSubstansi> {
    const supabase = supabaseClient();
    
    try {
      const { details, isFinalized, id_proposal, id_reviewer } = input;
      
      // Cek apakah reviewer valid
      const { data: reviewerData, error: reviewerError } = await supabase
        .from('reviewer')
        .select('id_reviewer')
        .eq('id_proposal', id_proposal)
        .eq('id_user', id_reviewer)
        .single();
      
      if (reviewerError || !reviewerData) {
        throw new Error('Reviewer tidak ditemukan');
      }
      
      // Cek apakah penilaian sudah ada
      const { data: existingPenilaian } = await supabase
        .from('penilaian_substansi')
        .select('*')
        .eq('id_reviewer', reviewerData.id_reviewer)
        .single();
      
      if (existingPenilaian) {
        throw new Error('Penilaian sudah ada untuk reviewer dan proposal ini');
      }
      
      // Hitung total nilai
      const total_nilai = details.reduce((sum, detail) => sum + (detail.nilai || 0), 0);
      
      // Status true jika sudah dinilai (isFinalized = true)
      const status = isFinalized ? true : false;
      
      // Buat penilaian utama
      const { data: penilaianData, error: penilaianError } = await supabase
        .from('penilaian_substansi')
        .insert({
          id_reviewer: reviewerData.id_reviewer,
          total_nilai,
          status,
          catatan: input.catatan || null,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();
      
      if (penilaianError) throw penilaianError;
      
      // Buat detail penilaian
      const detailValues = details.map(detail => ({
        id_penilaian: penilaianData.id,
        id_kriteria: detail.id_kriteria,
        skor: detail.skor,
        nilai: detail.nilai
      }));
      
      const { error: detailError } = await supabase
        .from('detail_penilaian_substansi')
        .insert(detailValues);
      
      if (detailError) throw detailError;
      
      return penilaianData;
    } catch (error) {
      console.error('Error in createPenilaian:', error);
      throw error;
    }
  },

  // Update penilaian substansi
  async updatePenilaian(
    id: number,
    input: PenilaianSubstansiInput
  ): Promise<PenilaianSubstansi> {
    const supabase = supabaseClient();
    
    try {
      const { details, isFinalized, catatan } = input;
      
      // Hitung total nilai baru
      const total_nilai = details.reduce((sum, detail) => sum + (detail.nilai || 0), 0);
      
      // Update penilaian utama
      const { data: penilaianData, error: penilaianError } = await supabase
        .from('penilaian_substansi')
        .update({
          total_nilai,
          status: isFinalized ? true : false,
          catatan: catatan || null,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (penilaianError) throw penilaianError;
      
      // Hapus detail penilaian lama
      await supabase
        .from('detail_penilaian_substansi')
        .delete()
        .eq('id_penilaian', id);
      
      // Buat detail penilaian baru
      const detailValues = details.map(detail => ({
        id_penilaian: id,
        id_kriteria: detail.id_kriteria,
        skor: detail.skor,
        nilai: detail.nilai
      }));
      
      const { error: detailError } = await supabase
        .from('detail_penilaian_substansi')
        .insert(detailValues);
      
      if (detailError) throw detailError;
      
      return penilaianData;
    } catch (error) {
      console.error('Error in updatePenilaian:', error);
      throw error;
    }
  },

  // Mendapatkan jumlah proposal per bidang yang perlu dinilai
  async getProposalCountByBidang(userId: string): Promise<Array<{id_bidang_pkm: number, nama: string, count: number}>> {
    const supabase = supabaseClient();
    
    try {
      const { data, error } = await supabase
        .from('reviewer')
        .select(`
          proposal:id_proposal (
            id_proposal,
            id_bidang_pkm,
            bidang_pkm (
              id_bidang_pkm,
              nama
            )
          )
        `)
        .eq('id_user', userId);
      
      if (error) throw error;
      
      // Group dan hitung proposal per bidang
      const bidangCounts = data.reduce((acc: any, curr: any) => {
        const bidang = curr.proposal?.bidang_pkm;
        if (bidang) {
          const existing = acc.find((b: any) => b.id_bidang_pkm === bidang.id_bidang_pkm);
          if (existing) {
            existing.count++;
          } else {
            acc.push({
              id_bidang_pkm: bidang.id_bidang_pkm,
              nama: bidang.nama,
              count: 1
            });
          }
        }
        return acc;
      }, []);
      
      return bidangCounts;
    } catch (error) {
      console.error('Error in getProposalCountByBidang:', error);
      throw error;
    }
  }
}; 
import { supabaseClient } from '@/lib/supabase/client';
import { KriteriaAdministrasi } from './kriteria-administrasi-service';

export interface PenilaianAdministrasi {
  id_penilaian_administrasi: number;
  created_at: string;
  status: boolean | null;
  updated_at: string | null;
  total_kesalahan: number | null;
  catatan: string | null;
  id_reviewer: number | null;
}

export interface DetailPenilaianAdministrasi {
  id_detail_penilaian: number;
  created_at: string;
  kesalahan: boolean | null;
  id_penilaian: number | null;
  id_kriteria: number | null;
  kriteria?: KriteriaAdministrasi;
}

export interface DetailPenilaianAdministrasiInput {
  id_kriteria: number;
  kesalahan: boolean;
}

export interface PenilaianAdministrasiInput {
  id_reviewer: string;
  id_proposal: number;
  details: DetailPenilaianAdministrasiInput[];
  isFinalized?: boolean;
  catatan?: string;
}

export interface PenilaianAdministrasiLengkap {
  penilaian: PenilaianAdministrasi;
  details: DetailPenilaianAdministrasi[];
}

export const PenilaianAdministrasiService = {
  // Mendapatkan penilaian administrasi berdasarkan id_reviewer dan id_proposal
  async getPenilaianByReviewerAndProposal(id_reviewer: string, id_proposal: number): Promise<PenilaianAdministrasiLengkap | null> {
    const supabase = supabaseClient();
    
    if (!id_reviewer) {
      return null;
    }
    
    // Cari reviewer untuk mendapatkan id_reviewer
    try {
      const { data: reviewerData, error: reviewerError } = await supabase
        .from('reviewer')
        .select('id_reviewer')
        .eq('id_proposal', id_proposal)
        .eq('id_user', id_reviewer)
        .single();
      
      if (reviewerError) {
        // Jika error adalah PGRST116 (not found), berarti reviewer belum ditugaskan
        if (reviewerError.code === 'PGRST116') {
          return null;
        }
        return null;
      }
      
      if (!reviewerData) {
        return null;
      }
      
      // Cari penilaian administrasi berdasarkan id_reviewer
      const { data: penilaianData, error: penilaianError } = await supabase
        .from('penilaian_administrasi')
        .select('*')
        .eq('id_reviewer', reviewerData.id_reviewer)
        .single();
      
      if (penilaianError) {
        if (penilaianError.code === 'PGRST116') {
          return null;
        }
        return null;
      }
      
      if (!penilaianData) {
        return null;
      }
      
      // Cari detail penilaian administrasi
      const { data: detailData, error: detailError } = await supabase
        .from('detail_penilaian_administrasi')
        .select(`
          *,
          kriteria:id_kriteria (
            id_kriteria,
            deskripsi
          )
        `)
        .eq('id_penilaian', penilaianData.id_penilaian_administrasi);
      
      if (detailError) {
        return null;
      }
      
      return {
        penilaian: penilaianData,
        details: detailData || []
      };
    } catch (error) {
      return null;
    }
  },
  
  // Membuat penilaian administrasi baru
  async createPenilaian(input: PenilaianAdministrasiInput): Promise<PenilaianAdministrasi> {
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
      
      if (reviewerError) {
        throw new Error('Reviewer tidak ditemukan');
      }
      
      if (!reviewerData) {
        throw new Error('Reviewer tidak ditemukan');
      }
      
      // Cek apakah penilaian sudah ada
      const { data: existingPenilaian, error: existingError } = await supabase
        .from('penilaian_administrasi')
        .select('*')
        .eq('id_reviewer', reviewerData.id_reviewer)
        .single();
      
      if (existingPenilaian) {
        throw new Error('Penilaian sudah ada untuk reviewer dan proposal ini');
      }
      
      // Hitung total kesalahan
      const total_kesalahan = details.filter(d => d.kesalahan).length;
      
      // Status true jika sudah dinilai (isFinalized = true)
      const status = isFinalized ? true : false;
      
      // Buat penilaian utama
      const { data: penilaianData, error: penilaianError } = await supabase
        .from('penilaian_administrasi')
        .insert({
          id_reviewer: reviewerData.id_reviewer,
          total_kesalahan,
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
        id_penilaian: penilaianData.id_penilaian_administrasi,
        id_kriteria: detail.id_kriteria,
        kesalahan: detail.kesalahan
      }));
      
      const { error: detailError } = await supabase
        .from('detail_penilaian_administrasi')
        .insert(detailValues);
      
      if (detailError) throw detailError;
      
      return penilaianData;
    } catch (error) {
      throw error;
    }
  },
  
  // Memperbarui penilaian administrasi yang sudah ada
  async updatePenilaian(id: number, input: PenilaianAdministrasiInput) {
    const supabase = supabaseClient();
    
    try {
      // Hitung total kesalahan dari detail yang diberikan
      const totalKesalahan = input.details.filter(item => item.kesalahan).length;
      
      // Status true jika sudah dinilai (isFinalized = true)
      const status = input.isFinalized ? true : false;
      
      // Update penilaian administrasi
      const { error: penilaianError } = await supabase
        .from('penilaian_administrasi')
        .update({
          total_kesalahan: totalKesalahan,
          catatan: input.catatan || null,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id_penilaian_administrasi', id);
      
      if (penilaianError) {
        throw penilaianError;
      }
      
      // Hapus detail penilaian yang lama
      const { error: deleteError } = await supabase
        .from('detail_penilaian_administrasi')
        .delete()
        .eq('id_penilaian', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert detail penilaian baru
      if (input.details && input.details.length > 0) {
        const detailsInsert = input.details.map(detail => ({
          id_penilaian: id,
          id_kriteria: detail.id_kriteria,
          kesalahan: detail.kesalahan
        }));
        
        const { error: insertError } = await supabase
          .from('detail_penilaian_administrasi')
          .insert(detailsInsert);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      return { success: true };
    } catch (error) {
      throw new Error("Gagal memperbarui penilaian administrasi");
    }
  },
  
  // Mendapatkan jumlah proposal per bidang PKM yang harus dinilai oleh reviewer
  async getProposalCountByBidang(id_reviewer_user: string): Promise<Array<{id_bidang_pkm: number, nama: string, count: number}>> {
    const supabase = supabaseClient();
    
    try {
      // Dapatkan semua reviewer_id untuk user ini
      const { data: reviewerIds, error: reviewerError } = await supabase
        .from('reviewer')
        .select('id_reviewer, id_proposal')
        .eq('id_user', id_reviewer_user);
      
      if (reviewerError) {
        throw reviewerError;
      }
      
      if (!reviewerIds || reviewerIds.length === 0) {
        return [];
      }
      
      // Dapatkan id_proposal dari reviewer
      const proposalIds = reviewerIds.map(r => r.id_proposal);
      
      // Dapatkan proposal dengan bidang PKM
      const { data: proposals, error: proposalError } = await supabase
        .from('proposal')
        .select(`
          id_proposal, 
          id_bidang_pkm,
          bidang_pkm (
            id_bidang_pkm, 
            nama
          )
        `)
        .in('id_proposal', proposalIds);
      
      if (proposalError) {
        throw proposalError;
      }
      
      // Hitung jumlah proposal per bidang
      const bidangCounts: Record<number, {count: number, nama: string}> = {};
      
      // Gunakan tipe any untuk menghindari error TypeScript
      (proposals as any[]).forEach(proposal => {
        const bidangId = proposal.id_bidang_pkm;
        if (!bidangCounts[bidangId]) {
          // Akses bidang_pkm dengan cara yang lebih aman
          const bidangNama = proposal.bidang_pkm && typeof proposal.bidang_pkm === 'object' ? 
            // Jika bidang_pkm adalah array, ambil elemen pertama
            (Array.isArray(proposal.bidang_pkm) ? 
              (proposal.bidang_pkm[0]?.nama || 'Unknown') : 
              // Jika bidang_pkm adalah objek biasa
              (proposal.bidang_pkm.nama || 'Unknown')) 
            : 'Unknown';
            
          bidangCounts[bidangId] = {
            count: 0,
            nama: bidangNama
          };
        }
        bidangCounts[bidangId].count += 1;
      });
      
      // Format hasil untuk dikembalikan
      const result = Object.entries(bidangCounts).map(([id_bidang_pkm, data]) => ({
        id_bidang_pkm: parseInt(id_bidang_pkm),
        nama: data.nama,
        count: data.count
      }));
      
      return result;
    } catch (error) {
      throw error;
    }
  },
  
  // Mendapatkan proposal dalam bidang tertentu yang ditugaskan ke reviewer
  async getProposalsByBidang(id_reviewer_user: string, id_bidang_pkm: number): Promise<any[]> {
    const supabase = supabaseClient();
    
    try {
      // Dapatkan semua reviewer_id untuk user ini
      const { data: reviewerIds, error: reviewerError } = await supabase
        .from('reviewer')
        .select('id_reviewer, id_proposal')
        .eq('id_user', id_reviewer_user);
      
      if (reviewerError) {
        throw reviewerError;
      }
      
      if (!reviewerIds || reviewerIds.length === 0) {
        return [];
      }
      
      // Dapatkan id_proposal dari reviewer
      const proposalIds = reviewerIds.map(r => r.id_proposal);
      
      // Dapatkan proposal dengan bidang PKM yang cocok
      const { data: proposals, error: proposalError } = await supabase
        .from('proposal')
        .select(`
          *,
          mahasiswa (*),
          dosen (*),
          bidang_pkm (*)
        `)
        .in('id_proposal', proposalIds)
        .eq('id_bidang_pkm', id_bidang_pkm);
      
      if (proposalError) {
        throw proposalError;
      }
      
      // Periksa status proposal dan tambahkan status "Belum Dinilai" jika belum ada penilaian
      const proposalsWithStatus = await Promise.all((proposals || []).map(async (proposal) => {
        // Jika proposal belum memiliki status_penilaian, beri status "Belum Dinilai"
        if (!proposal.status_penilaian) {
          // Cek apakah sudah ada penilaian administrasi
          const { data: penilaian, error: penilaianError } = await supabase
            .from('penilaian_administrasi')
            .select('status')
            .eq('id_reviewer', reviewerIds.find(r => r.id_proposal === proposal.id_proposal)?.id_reviewer || 0)
            .maybeSingle();
          
          if (penilaianError) {
          }
          
          // Update status berdasarkan penilaian yang ada
          if (!penilaian) {
            // Belum ada penilaian sama sekali
            proposal.status_penilaian = 'Belum Dinilai';
          } else if (penilaian.status !== 'Sudah Dinilai') {
            // Ada penilaian tapi belum selesai
            proposal.status_penilaian = 'Belum Dinilai';
          } else {
            // Sudah selesai dinilai
            proposal.status_penilaian = 'Sudah Dinilai';
          }
          
          // Update status di database
          const { error: updateError } = await supabase
            .from('proposal')
            .update({ status_penilaian: proposal.status_penilaian })
            .eq('id_proposal', proposal.id_proposal);
          
          if (updateError) {
          }
        }
        
        return proposal;
      }));
      
      return proposalsWithStatus;
    } catch (error) {
      throw error;
    }
  }
}; 
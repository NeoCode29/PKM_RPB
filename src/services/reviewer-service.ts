import { supabaseClient } from '@/lib/supabase/client';

// Interface untuk statistik reviewer
export interface ReviewerStats {
  totalProposals: number;
  assignedProposals: number;
  unratedProposals: number; // Jumlah proposal yang belum dinilai
}

// Service untuk reviewer
export const ReviewerService = {
  // Mendapatkan semua proposal yang ditugaskan ke reviewer tertentu
  async getAssignedProposals(userId?: string): Promise<any[]> {
    const supabase = supabaseClient();
    
    if (!userId && typeof window !== 'undefined') {
      // Jika client-side dan tidak ada userId, coba ambil dari localStorage
      userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '';
    }
    
    console.log('Fetching assigned proposals for reviewer ID:', userId);
    
    // Query untuk mendapatkan proposal yang ditugaskan ke reviewer
    const { data, error } = await supabase
      .from('reviewer')
      .select(`
        id_reviewer,
        id_proposal,
        no,
        proposal (
          id_proposal,
          judul,
          status_penilaian,
          url_file,
          jumlah_anggota,
          created_at,
          mahasiswa (*),
          dosen (*),
          bidang_pkm (*)
        )
      `)
      .eq('id_user', userId);
    
    if (error) {
      console.error('Error fetching assigned proposals:', error);
      throw error;
    }
    
    // Transform data untuk sesuai dengan format yang dibutuhkan
    const transformedData = data
      .filter(item => item.proposal) // Filter item yang tidak memiliki proposal (null)
      .map((item: any) => {
        return {
          ...item.proposal,
          reviewers: [] // Kosong karena tidak dibutuhkan di dashboard reviewer
        };
      });
    
    return transformedData;
  },
  
  // Mendapatkan statistik untuk reviewer
  async getReviewerStats(userId?: string): Promise<ReviewerStats> {
    const supabase = supabaseClient();
    
    if (!userId && typeof window !== 'undefined') {
      // Jika client-side dan tidak ada userId, coba ambil dari localStorage
      userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '';
    }
    
    // Mendapatkan total proposal dalam sistem
    const { count: totalCount, error: totalError } = await supabase
      .from('proposal')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Error fetching total proposals:', totalError);
      throw totalError;
    }
    
    // Mendapatkan jumlah proposal yang ditugaskan ke reviewer
    const { count: assignedCount, error: assignedError } = await supabase
      .from('reviewer')
      .select('*', { count: 'exact', head: true })
      .eq('id_user', userId);
    
    if (assignedError) {
      console.error('Error fetching assigned proposals count:', assignedError);
      throw assignedError;
    }
    
    // Mendapatkan jumlah proposal yang belum dinilai (status 'Belum Dinilai' atau null)
    const { data: unratedData, error: unratedError } = await supabase
      .from('reviewer')
      .select(`
        id_reviewer,
        proposal:id_proposal (
          id_proposal,
          status_penilaian
        )
      `)
      .eq('id_user', userId);
    
    if (unratedError) {
      console.error('Error fetching unrated proposals:', unratedError);
      throw unratedError;
    }
    
    // Hitung jumlah proposal yang belum dinilai
    const unratedCount = unratedData.filter((item: any) => {
      return item.proposal && 
        (item.proposal.status_penilaian === 'Belum Dinilai' || 
         item.proposal.status_penilaian === null);
    }).length;
    
    return {
      totalProposals: totalCount || 0,
      assignedProposals: assignedCount || 0,
      unratedProposals: unratedCount || 0
    };
  }
}; 
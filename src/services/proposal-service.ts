import { supabaseClient } from '@/lib/supabase/client';
import { supabaseServer } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

// Tipe data untuk bidang PKM
export interface BidangPkm {
  id_bidang_pkm: number;
  nama: string;
}

// Tipe data untuk mahasiswa
export interface Mahasiswa {
  id_mahasiswa: number;
  nama: string;
  nim: string;
  program_studi: string;
  jurusan: string;
  nomer_hp: string;
  email: string;
}

// Tipe data untuk dosen
export interface Dosen {
  id_dosen: number;
  nama: string;
  nidn: string;
  email: string;
  nomer_hp: string;
}

// Tipe data untuk user (reviewer)
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Tipe data untuk reviewer
export interface Reviewer {
  id_reviewer: string | number;
  id_proposal: number;
  id_user: string;
  no: number; // 1 atau 2
  user?: User;
}

// Tipe data untuk detail pendanaan
export interface DetailPendanaan {
  id: number;
  dana_simbelmawa: number;
  dana_perguruan_tinggi: number;
  dana_pihak_lain: number;
  id_proposal: number;
}

// Tipe data untuk proposal
export interface Proposal {
  id_proposal: number;
  judul: string;
  id_mahasiswa: number;
  id_dosen: number;
  id_bidang_pkm: number;
  url_file: string | null;
  status_penilaian: string | null;
  jumlah_anggota: number;
  created_at: string;
}

// Tipe data proposal dengan relasi
export interface ProposalWithRelations {
  id_proposal: number;
  judul: string;
  url_file: string | null;
  status_penilaian: string | null;
  jumlah_anggota: number;
  created_at: string;
  mahasiswa: Mahasiswa;
  dosen: Dosen;
  bidang_pkm: BidangPkm;
  reviewers: Reviewer[];
  detail_pendanaan?: DetailPendanaan;
}

// Interface untuk filter proposal
export interface ProposalFilter {
  search?: string;
  bidang_pkm_id?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}

// Interface untuk hasil pagination
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interface untuk input proposal
export interface ProposalInput {
  judul: string;
  // Data mahasiswa
  nama_mahasiswa: string;
  nim: string;
  program_studi: string;
  jurusan: string;
  nomer_hp_mahasiswa: string;
  email_mahasiswa: string;
  // Data dosen
  nama_dosen: string;
  nidn: string;
  email_dosen: string;
  nomer_hp_dosen: string;
  // Data proposal
  url_file?: string;
  status_penilaian?: string;
  jumlah_anggota: number;
  id_bidang_pkm: number;
  // Data pendanaan
  dana_simbelmawa?: number;
  dana_perguruan_tinggi?: number;
  dana_pihak_lain?: number;
  // Data reviewer
  reviewer1_id?: string;
  reviewer2_id?: string;
}

interface ProposalReviewData {
  id_proposal: number;
  judul: string;
  ketua: string;
  status_penilaian: boolean;
}

interface ReviewerQueryResult {
  id_reviewer: number;
  proposal: {
    id_proposal: number;
    judul: string;
    mahasiswa: {
      nama: string;
    };
    id_bidang_pkm: number;
  };
  penilaian_substansi: {
    status: boolean;
  }[];
}

// Service untuk proposal
export const ProposalService = {
  // Mendapatkan semua proposal dengan filter opsional
  async getAll(filter: ProposalFilter = {}): Promise<PaginatedResult<ProposalWithRelations>> {
    const supabase = supabaseClient();
    
    // Default pagination values
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    
    let query = supabase
    .from('proposal')
    .select(`
      *,
      mahasiswa (*),
      dosen (*),
      bidang_pkm (*),
      reviewer (
          id_reviewer,
          id_proposal,
          id_user,
          no,
          users (id, username, email, role)
        ),
        detail_pendanaan (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);
    
    // Terapkan filter jika ada
    if (filter.search) {
      query = query.ilike('judul', `%${filter.search}%`);
    }
    
    if (filter.bidang_pkm_id) {
      query = query.eq('id_bidang_pkm', filter.bidang_pkm_id);
    }
    
    if (filter.status) {
      query = query.eq('status_penilaian', filter.status);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    const transformedData = data.map((item: any) => {
      // Transform data reviewer
      const transformedReviewers = item.reviewer ? item.reviewer.map((r: any) => {
        return {
          id_reviewer: r.id_reviewer,
          id_proposal: r.id_proposal,
          id_user: r.id_user,
          no: r.no,
          user: r.users // Mengambil dari properti 'users'
        };
      }) : [];
      
      return {
        ...item,
        mahasiswa: item.mahasiswa,
        dosen: item.dosen,
        bidang_pkm: item.bidang_pkm,
        reviewers: transformedReviewers,
        detail_pendanaan: item.detail_pendanaan && item.detail_pendanaan.length > 0 
          ? item.detail_pendanaan[0] 
          : null
      };
    });
    
    return {
      data: transformedData,
      count: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    };
  },
  
  // Mendapatkan detail proposal berdasarkan ID
  async getById(id: number): Promise<ProposalWithRelations | null> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('proposal')
        .select(`
            *,
            mahasiswa (*),
            dosen (*),
            bidang_pkm (*),
            reviewer (
          id_reviewer,
          id_proposal,
          id_user,
          no,
          users (id, username, email, role)
        ),
        detail_pendanaan (*)
      `)
      .eq('id_proposal', id)
      .single();

    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    // Transform data reviewer untuk memperbaiki struktur
    const transformedReviewers = data.reviewer ? data.reviewer.map((r: any) => {
      return {
        id_reviewer: r.id_reviewer,
        id_proposal: r.id_proposal,
        id_user: r.id_user,
        no: r.no,
        user: r.users // Mengambil dari properti 'users'
      };
    }) : [];
    
    return {
      ...data,
      mahasiswa: data.mahasiswa,
      dosen: data.dosen,
      bidang_pkm: data.bidang_pkm,
      reviewers: transformedReviewers,
      detail_pendanaan: data.detail_pendanaan && data.detail_pendanaan.length > 0 
        ? data.detail_pendanaan[0] 
        : null
    };
  },
  
  // Membuat proposal baru
  async create(input: ProposalInput): Promise<ProposalWithRelations> {
    const supabase = supabaseClient();
    
    // Mulai transaksi
    // 1. Cek apakah mahasiswa sudah ada berdasarkan NIM
    let mahasiswaId: number;
    let dosenId: number;
    
    const { data: existingMahasiswa } = await supabase
      .from('mahasiswa')
      .select('id_mahasiswa')
      .eq('nim', input.nim)
      .single();
    
    if (existingMahasiswa) {
      mahasiswaId = existingMahasiswa.id_mahasiswa;
      
      // Update data mahasiswa jika perlu
      await supabase
        .from('mahasiswa')
        .update({
          nama: input.nama_mahasiswa,
          program_studi: input.program_studi,
          jurusan: input.jurusan,
          nomer_hp: input.nomer_hp_mahasiswa,
          email: input.email_mahasiswa
        })
        .eq('id_mahasiswa', mahasiswaId);
    } else {
      // Buat mahasiswa baru
      const { data: newMahasiswa, error: mahasiswaError } = await supabase
        .from('mahasiswa')
        .insert({
          nama: input.nama_mahasiswa,
          nim: input.nim,
          program_studi: input.program_studi,
          jurusan: input.jurusan,
          nomer_hp: input.nomer_hp_mahasiswa,
          email: input.email_mahasiswa
        })
        .select()
        .single();
      
      if (mahasiswaError) throw mahasiswaError;
      mahasiswaId = newMahasiswa.id_mahasiswa;
    }
    
    // 2. Cek apakah dosen sudah ada berdasarkan NIDN
    const { data: existingDosen } = await supabase
      .from('dosen')
      .select('id_dosen')
      .eq('nidn', input.nidn)
      .single();
    
    if (existingDosen) {
      dosenId = existingDosen.id_dosen;
      
      // Update data dosen jika perlu
      await supabase
        .from('dosen')
        .update({
          nama: input.nama_dosen,
          email: input.email_dosen,
          nomer_hp: input.nomer_hp_dosen
        })
        .eq('id_dosen', dosenId);
    } else {
      // Buat dosen baru
      const { data: newDosen, error: dosenError } = await supabase
        .from('dosen')
        .insert({
          nama: input.nama_dosen,
          nidn: input.nidn,
          email: input.email_dosen,
          nomer_hp: input.nomer_hp_dosen
        })
        .select()
        .single();
      
      if (dosenError) throw dosenError;
      dosenId = newDosen.id_dosen;
    }
    
    // 3. Buat proposal
    const { data: newProposal, error: proposalError } = await supabase
      .from('proposal')
      .insert({
        judul: input.judul,
        id_mahasiswa: mahasiswaId,
        id_dosen: dosenId,
        id_bidang_pkm: input.id_bidang_pkm,
        url_file: input.url_file,
        status_penilaian: input.status_penilaian || 'Belum Dinilai',
        jumlah_anggota: input.jumlah_anggota
      })
      .select()
      .single();
    
    if (proposalError) throw proposalError;
    
    // 4. Buat detail pendanaan
    if (input.dana_simbelmawa || input.dana_perguruan_tinggi || input.dana_pihak_lain) {
      await supabase
        .from('detail_pendanaan')
        .insert({
          id_proposal: newProposal.id_proposal,
          dana_simbelmawa: input.dana_simbelmawa || 0,
          dana_perguruan_tinggi: input.dana_perguruan_tinggi || 0,
          dana_pihak_lain: input.dana_pihak_lain || 0
        });
    }
    
    // 5. Tambahkan reviewer jika ada
    if (input.reviewer1_id) {
      await supabase
        .from('reviewer')
        .insert({
          id_proposal: newProposal.id_proposal,
          id_user: input.reviewer1_id,
          no: 1
        });
    }
    
    if (input.reviewer2_id) {
      await supabase
        .from('reviewer')
        .insert({
          id_proposal: newProposal.id_proposal,
          id_user: input.reviewer2_id,
          no: 2
        });
    }
    
    // Ambil data lengkap proposal
    return await this.getById(newProposal.id_proposal) as ProposalWithRelations;
  },
  
  // Memperbarui proposal
  async update(id: number, input: Partial<ProposalInput>): Promise<ProposalWithRelations> {
    const supabase = supabaseClient();
    
    // Dapatkan proposal yang ada
    const { data: existingProposal, error: getError } = await supabase
      .from('proposal')
      .select('id_mahasiswa, id_dosen, id_proposal')
      .eq('id_proposal', id)
      .single();
    
    if (getError) {
      throw getError;
    }
    
    if (!existingProposal) {
      throw new Error(`Proposal ID ${id} tidak ditemukan`);
    }
    
    // Update data mahasiswa jika ada
    if (existingProposal.id_mahasiswa && 
        (input.nama_mahasiswa || input.nim || input.program_studi || 
         input.jurusan || input.nomer_hp_mahasiswa || input.email_mahasiswa)) {
      
      const mahasiswaUpdateData: any = {};
      if (input.nama_mahasiswa) mahasiswaUpdateData.nama = input.nama_mahasiswa;
      if (input.nim) mahasiswaUpdateData.nim = input.nim;
      if (input.program_studi) mahasiswaUpdateData.program_studi = input.program_studi;
      if (input.jurusan) mahasiswaUpdateData.jurusan = input.jurusan;
      if (input.nomer_hp_mahasiswa) mahasiswaUpdateData.nomer_hp = input.nomer_hp_mahasiswa;
      if (input.email_mahasiswa) mahasiswaUpdateData.email = input.email_mahasiswa;
      
      if (Object.keys(mahasiswaUpdateData).length > 0) {
        const { error: mahasiswaUpdateError } = await supabase
          .from('mahasiswa')
          .update(mahasiswaUpdateData)
          .eq('id_mahasiswa', existingProposal.id_mahasiswa);
        
        if (mahasiswaUpdateError) {
          throw mahasiswaUpdateError;
        }
      }
    }
    
    // Update data dosen jika ada
    if (existingProposal.id_dosen && 
        (input.nama_dosen || input.nidn || input.email_dosen || input.nomer_hp_dosen)) {
      
      const dosenUpdateData: any = {};
      if (input.nama_dosen) dosenUpdateData.nama = input.nama_dosen;
      if (input.nidn) dosenUpdateData.nidn = input.nidn;
      if (input.email_dosen) dosenUpdateData.email = input.email_dosen;
      if (input.nomer_hp_dosen) dosenUpdateData.nomer_hp = input.nomer_hp_dosen;
      
      if (Object.keys(dosenUpdateData).length > 0) {
        const { error: dosenUpdateError } = await supabase
          .from('dosen')
          .update(dosenUpdateData)
          .eq('id_dosen', existingProposal.id_dosen);
        
        if (dosenUpdateError) {
          throw dosenUpdateError;
        }
      }
    }
    
    // Update detail pendanaan jika ada
    if (input.dana_simbelmawa !== undefined || 
        input.dana_perguruan_tinggi !== undefined || 
        input.dana_pihak_lain !== undefined) {
      
      // Cek apakah detail pendanaan sudah ada
      const { data: existingPendanaan, error: pendanaanError } = await supabase
        .from('detail_pendanaan')
        .select('*')
        .eq('id_proposal', id)
        .maybeSingle();
      
      if (pendanaanError) {
        throw pendanaanError;
      }
      
      // Pastikan nilai numerik yang valid
      const dana_simbelmawa = input.dana_simbelmawa !== undefined ? 
        (typeof input.dana_simbelmawa === 'string' ? 
          parseFloat(input.dana_simbelmawa) || 0 : input.dana_simbelmawa || 0) : 
        (existingPendanaan?.dana_simbelmawa || 0);
        
      const dana_perguruan_tinggi = input.dana_perguruan_tinggi !== undefined ? 
        (typeof input.dana_perguruan_tinggi === 'string' ? 
          parseFloat(input.dana_perguruan_tinggi) || 0 : input.dana_perguruan_tinggi || 0) : 
        (existingPendanaan?.dana_perguruan_tinggi || 0);
        
      const dana_pihak_lain = input.dana_pihak_lain !== undefined ? 
        (typeof input.dana_pihak_lain === 'string' ? 
          parseFloat(input.dana_pihak_lain) || 0 : input.dana_pihak_lain || 0) : 
        (existingPendanaan?.dana_pihak_lain || 0);
      
      const pendanaanData = {
        dana_simbelmawa,
        dana_perguruan_tinggi,
        dana_pihak_lain
      };
      
      if (existingPendanaan) {
        // Update pendanaan yang sudah ada
        const { error: updatePendanaanError } = await supabase
          .from('detail_pendanaan')
          .update(pendanaanData)
          .eq('id', existingPendanaan.id);
        
        if (updatePendanaanError) {
          throw updatePendanaanError;
        }
      } else {
        // Buat pendanaan baru jika belum ada
        const { error: insertPendanaanError } = await supabase
          .from('detail_pendanaan')
          .insert({
            ...pendanaanData,
            id_proposal: id
          });
        
        if (insertPendanaanError) {
          throw insertPendanaanError;
        }
      }
    }
    
    // Update data proposal (judul, status, dll)
    if (input.judul || input.status_penilaian || input.jumlah_anggota || 
        input.url_file || input.id_bidang_pkm !== undefined) {
      const proposalUpdateData: any = {};
      
      if (input.judul) proposalUpdateData.judul = input.judul;
      if (input.status_penilaian) proposalUpdateData.status_penilaian = input.status_penilaian;
      
      // Pastikan jumlah_anggota adalah nilai numerik yang valid
      if (input.jumlah_anggota !== undefined) {
        const jumlahAnggota = typeof input.jumlah_anggota === 'string' 
          ? parseInt(input.jumlah_anggota) || 1 
          : input.jumlah_anggota || 1;
        proposalUpdateData.jumlah_anggota = jumlahAnggota;
      }
      
      if (input.url_file) proposalUpdateData.url_file = input.url_file;
      
      // Pastikan id_bidang_pkm adalah nilai numerik yang valid
      if (input.id_bidang_pkm !== undefined) {
        const idBidangPkm = typeof input.id_bidang_pkm === 'string' 
          ? parseInt(input.id_bidang_pkm) 
          : input.id_bidang_pkm;
        proposalUpdateData.id_bidang_pkm = idBidangPkm;
      }
      
      const { error: updateError } = await supabase
        .from('proposal')
        .update(proposalUpdateData)
        .eq('id_proposal', id);
      
      if (updateError) {
        throw updateError;
      }
    }
    
    // Handle reviewer1 update
    if (input.reviewer1_id !== undefined) {
      try {
        // Standardize empty/none values
        const reviewer1Value = (input.reviewer1_id === "" || input.reviewer1_id === "none") 
          ? null 
          : input.reviewer1_id;
          
        // Check for existing reviewer1
        const { data: existingReviewer1 } = await supabase
          .from('reviewer')
          .select('*')
          .eq('id_proposal', id)
          .eq('no', 1)
          .maybeSingle();
        
        if (existingReviewer1 && reviewer1Value === null) {
          // Delete reviewer if it exists and new value is null
          await supabase
            .from('reviewer')
            .delete()
            .eq('id_reviewer', existingReviewer1.id_reviewer);
          
        } else if (existingReviewer1 && reviewer1Value !== null) {
          // Update reviewer if it exists and value has changed
          if (existingReviewer1.id_user !== reviewer1Value) {
            await supabase
              .from('reviewer')
              .update({ id_user: reviewer1Value })
              .eq('id_reviewer', existingReviewer1.id_reviewer);
          }
          
        } else if (!existingReviewer1 && reviewer1Value !== null) {
          // Add new reviewer if it doesn't exist and new value is not null
          // Verify user exists first
          const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', reviewer1Value)
            .single();
            
          if (userExists) {
            await supabase
              .from('reviewer')
              .insert({
                id_proposal: id,
                id_user: reviewer1Value,
                no: 1
              });
          }
        }
      } catch (err) {
        // Handle error
      }
    }
    
    // Handle reviewer2 update
    if (input.reviewer2_id !== undefined) {
      try {
        // Standardize empty/none values
        const reviewer2Value = (input.reviewer2_id === "" || input.reviewer2_id === "none") 
          ? null 
          : input.reviewer2_id;
          
        // Check for existing reviewer2
        const { data: existingReviewer2 } = await supabase
          .from('reviewer')
          .select('*')
          .eq('id_proposal', id)
          .eq('no', 2)
          .maybeSingle();
        
        if (existingReviewer2 && reviewer2Value === null) {
          // Delete reviewer if it exists and new value is null
          await supabase
            .from('reviewer')
            .delete()
            .eq('id_reviewer', existingReviewer2.id_reviewer);
          
        } else if (existingReviewer2 && reviewer2Value !== null) {
          // Update reviewer if it exists and value has changed
          if (existingReviewer2.id_user !== reviewer2Value) {
            await supabase
              .from('reviewer')
              .update({ id_user: reviewer2Value })
              .eq('id_reviewer', existingReviewer2.id_reviewer);
          }
          
        } else if (!existingReviewer2 && reviewer2Value !== null) {
          // Add new reviewer if it doesn't exist and new value is not null
          // Verify user exists first
          const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', reviewer2Value)
            .single();
            
          if (userExists) {
            await supabase
              .from('reviewer')
              .insert({
                id_proposal: id,
                id_user: reviewer2Value,
                no: 2
              });
          }
        }
      } catch (err) {
        // Handle error
      }
    }
    
    // Tunggu sebentar untuk memastikan semua operasi selesai
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ambil data lengkap proposal yang sudah diupdate
    return await this.getById(id) as ProposalWithRelations;
  },
  
  // Menghapus proposal
  async delete(id: number): Promise<boolean> {
    const supabase = supabaseClient();
    
    // Proposal memiliki foreign key constraints dengan CASCADE delete,
    // sehingga detail_pendanaan dan reviewer akan otomatis terhapus
    const { error } = await supabase
      .from('proposal')
      .delete()
      .eq('id_proposal', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  },
  
  // Mendapatkan semua data bidang PKM untuk dropdown
  async getAllBidangPkm(): Promise<BidangPkm[]> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('bidang_pkm')
      .select('*')
      .order('nama');
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Mendapatkan reviewer yang tersedia (role="reviewer")
  async getAvailableReviewers(): Promise<User[]> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('role', 'reviewer')
      .order('username');
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Mendapatkan proposal yang ditugaskan ke reviewer
  async getProposalsByReviewerId(reviewerId: string): Promise<ProposalWithRelations[]> {
    const supabase = supabaseClient();
    
    if (!reviewerId) {
      return [];
    }
    
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
      .eq('id_user', reviewerId);
    
    if (error) {
      throw error;
    }
    
    // Transform data untuk sesuai dengan format yang dibutuhkan
    const transformedData = data
      .filter(item => item.proposal) // Filter item yang tidak memiliki proposal
      .map((item: any) => {
        return {
          ...item.proposal,
          id: item.proposal.id_proposal,
          title: item.proposal.judul,
          review_status: item.proposal.status_penilaian,
          submitter: {
            name: item.proposal.mahasiswa?.nama,
            nim: item.proposal.mahasiswa?.nim
          },
          bidang: item.proposal.bidang_pkm?.nama,
          reviewers: [] // Kosong karena tidak dibutuhkan di dashboard reviewer
        };
      });
    
    return transformedData;
  },
  
  // Import proposal dari file spreadsheet
  async importFromSpreadsheet(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const proposals: ProposalInput[] = [];
          const binaryString = event.target?.result;
          
          if (!binaryString) {
            throw new Error('Failed to read file');
          }
          
          // Deteksi tipe file
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            Papa.parse(binaryString as string, {
              header: true,
              skipEmptyLines: true,
              complete: async (results) => {
                if (results.data && Array.isArray(results.data)) {
                  for (const row of results.data as any[]) {
                    proposals.push(mapSpreadsheetRowToProposal(row));
                  }
                }
                
                // Buat proposal dari data yang diimpor
                const supabase = supabaseClient();
                let successCount = 0;
                
                for (const proposal of proposals) {
                  try {
                    await this.create(proposal);
                    successCount++;
                  } catch (error) {
                    // Handle error
                  }
                }
                
                resolve(successCount);
              },
              error: (error: Error) => {
                reject(error);
              }
            });
          } else {
            // Parse Excel
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            for (const row of data as any[]) {
              proposals.push(mapSpreadsheetRowToProposal(row));
            }
            
            // Buat proposal dari data yang diimpor
            let successCount = 0;
            
            for (const proposal of proposals) {
              try {
                await this.create(proposal);
                successCount++;
              } catch (error) {
                // Handle error
              }
            }
            
            resolve(successCount);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error: ProgressEvent<FileReader>) => {
        reject(error);
      };
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  },
  
  // Ekspor proposal ke file Excel
  async exportToExcel(proposals: ProposalWithRelations[]): Promise<Blob> {
    // Transform data untuk ekspor
    const exportData = proposals.map(p => ({
      'Judul Proposal': p.judul,
      'Status': p.status_penilaian,
      'Bidang PKM': p.bidang_pkm?.nama,
      'Nama Mahasiswa': p.mahasiswa?.nama,
      'NIM': p.mahasiswa?.nim,
      'Program Studi': p.mahasiswa?.program_studi,
      'Jurusan': p.mahasiswa?.jurusan,
      'Email Mahasiswa': p.mahasiswa?.email,
      'No HP Mahasiswa': p.mahasiswa?.nomer_hp,
      'Nama Dosen': p.dosen?.nama,
      'NIDN': p.dosen?.nidn,
      'Email Dosen': p.dosen?.email,
      'No HP Dosen': p.dosen?.nomer_hp,
      'Jumlah Anggota': p.jumlah_anggota,
      'URL File': p.url_file,
      'Dana Simbelmawa': p.detail_pendanaan?.dana_simbelmawa,
      'Dana Perguruan Tinggi': p.detail_pendanaan?.dana_perguruan_tinggi,
      'Dana Pihak Lain': p.detail_pendanaan?.dana_pihak_lain,
      'Reviewer 1': p.reviewers?.find(r => r.no === 1)?.user?.username,
      'Reviewer 2': p.reviewers?.find(r => r.no === 2)?.user?.username,
      'Tanggal Dibuat': new Date(p.created_at).toLocaleString()
    }));
    
    // Buat workbook dan worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proposals');
    
    // Generate file Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },
  
  // Membuat template Excel untuk import
  async createImportTemplate(): Promise<Blob> {
    const templateData = [
      {
        'judul': 'Judul Proposal Anda',
        'nama_mahasiswa': 'Nama Ketua',
        'nim': 'NIM Ketua',
        'program_studi': 'Program Studi',
        'jurusan': 'Jurusan',
        'nomer_hp_mahasiswa': 'Nomor HP Ketua',
        'email_mahasiswa': 'Email Ketua',
        'nama_dosen': 'Nama Dosen Pembimbing',
        'nidn': 'NIDN Dosen',
        'email_dosen': 'Email Dosen',
        'nomer_hp_dosen': 'Nomor HP Dosen',
        'jumlah_anggota': 1,
        'id_bidang_pkm': 'ID Bidang PKM', // Catatan: Isi dengan ID bidang PKM
        'url_file': 'URL File Proposal',
        'dana_simbelmawa': 0,
        'dana_perguruan_tinggi': 0,
        'dana_pihak_lain': 0
      }
    ];
    
    // Buat workbook dan worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Proposal');
    
    // Generate file Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  },
  
  // Mendapatkan proposal berdasarkan bidang dan reviewer
  async getProposalsByBidangAndReviewer(userId: string, bidangId: number): Promise<ProposalReviewData[]> {
    const supabase = supabaseClient();
    
    try {
      const { data, error } = await supabase
        .from('reviewer')
        .select(`
          id_reviewer,
          proposal (
            id_proposal,
            judul,
            id_bidang_pkm,
            mahasiswa (
              nama
            )
          ),
          penilaian_substansi (
            status
          )
        `)
        .eq('id_user', userId)
        .returns<ReviewerQueryResult[]>();

      if (error) throw error;
      if (!data) return [];

      // Filter dan transform data
      return data
        .filter(item => item.proposal?.id_bidang_pkm === bidangId)
        .map(item => ({
          id_proposal: item.proposal.id_proposal,
          judul: item.proposal.judul,
          ketua: item.proposal.mahasiswa?.nama || '',
          status_penilaian: item.penilaian_substansi?.[0]?.status || false
        }));
    } catch (error) {
      throw error;
    }
  }
};

// Fungsi helper untuk memetakan baris spreadsheet ke struktur ProposalInput
function mapSpreadsheetRowToProposal(row: any): ProposalInput {
  return {
    judul: row.judul || '',
    nama_mahasiswa: row.nama_mahasiswa || '',
    nim: row.nim || '',
    program_studi: row.program_studi || '',
    jurusan: row.jurusan || '',
    nomer_hp_mahasiswa: row.nomer_hp_mahasiswa || '',
    email_mahasiswa: row.email_mahasiswa || '',
    nama_dosen: row.nama_dosen || '',
    nidn: row.nidn || '',
    email_dosen: row.email_dosen || '',
    nomer_hp_dosen: row.nomer_hp_dosen || '',
    url_file: row.url_file || '',
    jumlah_anggota: parseInt(row.jumlah_anggota) || 1,
    id_bidang_pkm: parseInt(row.id_bidang_pkm) || 0,
    dana_simbelmawa: parseFloat(row.dana_simbelmawa) || 0,
    dana_perguruan_tinggi: parseFloat(row.dana_perguruan_tinggi) || 0,
    dana_pihak_lain: parseFloat(row.dana_pihak_lain) || 0
  };
} 
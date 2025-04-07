"use server"

import { supabaseServer } from "@/lib/supabase/server"

// Fungsi untuk mendapatkan semua data skema bidang PKM
export async function getAllBidangProposal() {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("bidang_pkm")
    .select(`
      id_bidang_pkm,
      nama
    `)
    .order('nama', { ascending: true })

  if (error) {
    console.error("Error fetching bidang PKM:", error)
    throw error
  }

  if (!data || data.length === 0) {
    console.warn("Tidak ada data bidang PKM ditemukan")
    return []
  }

  // Pastikan data yang dikembalikan sesuai dengan format yang diharapkan
  return data.map(item => ({
    id_bidang_pkm : item.id_bidang_pkm,
    nama: item.nama
  }))
}

// Fungsi untuk mengambil data bidang proposal berdasarkan id
export async function getBidangProposalById(id: string) {
  const supabase = await supabaseServer()

  const {data, error} = await supabase
    .from("bidang_pkm")
    .select("*")
    .eq("id_bidang_pkm", id)
    .single();

  if(error){
    throw error
  }

  return data || null;
}

// Interface untuk input data proposal baru
export interface ProposalInput {
  judul: string
  nama_ketua: string 
  nim: string
  jurusan: string
  program_studi: string
  nomer_hp_ketua: string
  email_ketua: string
  nama_dosen: string
  nidn: string
  email_dosen: string
  nomer_hp_dosen: string
  url_file: string
  status_penilaian: string
  jumlah_anggota: number
  id_bidang_pkm: string
}

// Fungsi untuk membuat proposal baru
export async function createProposal(data: ProposalInput) {
  const supabase = await supabaseServer()

  const { data: result, error } = await supabase
    .rpc('create_proposal', {
      nama_ketua: data.nama_ketua,
      nim: data.nim,
      jurusan: data.jurusan,
      program_studi: data.program_studi,
      nomer_hp_ketua: data.nomer_hp_ketua,
      email_ketua: data.email_ketua,
      nama_dosen: data.nama_dosen,
      nidn: data.nidn,
      email_dosen: data.email_dosen,
      nomer_hp_dosen: data.nomer_hp_dosen,
      judul: data.judul,
      url_file: data.url_file,
      status_penilaian: data.status_penilaian || "Belum Dinilai",
      jumlah_anggota: data.jumlah_anggota,
      id_bidang_pkm: parseInt(data.id_bidang_pkm)
    })

  if (error) {
    throw error
  }

  return result
}

// Fungsi untuk mengambil semua informasi proposal
export async function getAllProposals() {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('proposal')
    .select(`
      id_proposal,
      judul,
      mahasiswa (
        id_mahasiswa,
        nama
      ),
      bidang_pkm (
        id_bidang_pkm,
        nama
      ),
      jumlah_anggota,
      status_penilaian,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  // Format data untuk output yang konsisten
  const formattedData = data?.map(item => ({
    id: item.id_proposal,
    judul: item.judul,
    mahasiswa: item.mahasiswa?.[0] ? {
      id: item.mahasiswa[0].id_mahasiswa,
      nama: item.mahasiswa[0].nama
    } : null,
    bidang_pkm: item.bidang_pkm?.[0] ? {
      id: item.bidang_pkm[0].id_bidang_pkm,
      nama: item.bidang_pkm[0].nama
    } : null,
    jumlah_anggota: item.jumlah_anggota,
    status_penilaian: item.status_penilaian,
    created_at: item.created_at
  })) || []

  return formattedData
}

// Fungsi untuk mengambil informasi sebuah proposal berdasarkan id 
export async function getProposalById(id: string) {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('proposal')
    .select(`
      *,
      mahasiswa (*),
      dosen (*),
      bidang_pkm (*),
      reviewer (
        *,
        users (
          id,
          username,
          email
        )
      )
    `)
    .eq('id_proposal', id)
    .single()

  if (error) {
    throw error
  }

  // Format keluaran yang lebih terstruktur
  const result = {
    proposal: {
      id: data.id_proposal,
      judul: data.judul,
      bidang_pkm: {
        id: data.bidang_pkm.id_bidang_pkm,
        nama: data.bidang_pkm.nama
      },
      url_file: data.url_file,
      status_penilaian: data.status_penilaian,
      jumlah_anggota: data.jumlah_anggota,
      created_at: data.created_at,
      updated_at: data.updated_at,
      ketua_pengusul: {
        id: data.mahasiswa.id_mahasiswa,
        nama: data.mahasiswa.nama,
        nim: data.mahasiswa.nim,
        jurusan: data.mahasiswa.jurusan,
        program_studi: data.mahasiswa.program_studi,
        nomer_hp: data.mahasiswa.nomer_hp,
        email: data.mahasiswa.email,
      },
      dosen_pembimbing: {
        id: data.dosen.id_dosen,
        nama: data.dosen.nama,
        nidn: data.dosen.nidn,
        email: data.dosen.email,
        nomer_hp: data.dosen.nomer_hp
      },
      reviewer: {
        reviewer1: {
          id: data.reviewer[0]?.users?.id_reviewer || null,
          nama: data.reviewer[0]?.users?.username || null,
          email: data.reviewer[0]?.users?.email || null
        },
        reviewer2: {
          id: data.reviewer[1]?.users?.id_reviewer || null,
          nama: data.reviewer[1]?.users?.username || null,
          email: data.reviewer[1]?.users?.email || null
        }
      }
    }
  }

  return result
}

// Tipe data untuk proposal
export type Proposal = {
  id: string
  judul: string
  mahasiswa: {
    id_mahasiswa: string
    nama: string
    nim: string
    jurusan: string
    program_studi: string
    nomer_hp: string
    email: string
  }
  dosen: {
    id_dosen: string
    nama: string
    nidn: string
    email: string
    nomer_hp: string
  }
  bidang_pkm: {
    id_bidang_pkm: string
    nama: string
  }
  url_file: string
  status_penilaian: string
  jumlah_anggota: number
  reviewer: {
    reviewer1: {
      id_reviewer: string | null
      nama: string | null
      email: string | null
    }
    reviewer2: {
      id_reviewer: string | null
      nama: string | null
      email: string | null
    }
  }
  created_at: string
  updated_at?: string
}

// Tipe untuk data reviewer
export type ReviewerAssignment = {
    id: string
    no: number // 1 untuk reviewer1, 2 untuk reviewer2
}

// Fungsi untuk mengupdate proposal
export async function updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal> {
    const supabase = await supabaseServer()
    
    // Persiapkan data yang akan diupdate
    const updateData: any = {}
    
    // Hanya ambil field yang ada di tabel proposal
    if (updates.judul) updateData.judul = updates.judul
    if (updates.url_file) updateData.url_file = updates.url_file
    if (updates.status_penilaian) updateData.status_penilaian = updates.status_penilaian
    if (updates.jumlah_anggota) updateData.jumlah_anggota = updates.jumlah_anggota
    if (updates.bidang_pkm?.id_bidang_pkm) updateData.id_bidang_pkm = updates.bidang_pkm.id_bidang_pkm
    
    // Update proposal
    const { data, error } = await supabase
        .from("proposal")
        .update(updateData)
        .eq("id", id)
        .select(`
            *,
            mahasiswa (*),
            dosen (*),
            bidang_pkm (*),
            reviewer (
                *,
                users (
                    id,
                    username,
                    email
                )
            )
        `)
        .single()

    if (error) {
        throw error
    }

    // Format data sesuai dengan type Proposal
    const formattedData: Proposal = {
        id: data.id,
        judul: data.judul,
        bidang_pkm: {
            id_bidang_pkm: data.bidang_pkm.id_bidang_pkm,
            nama: data.bidang_pkm.nama
        },
        url_file: data.url_file,
        status_penilaian: data.status_penilaian,
        jumlah_anggota: data.jumlah_anggota,
        created_at: data.created_at,
        updated_at: data.updated_at,
        mahasiswa: {
            id_mahasiswa: data.mahasiswa.id_mahasiswa,
            nama: data.mahasiswa.nama,
            nim: data.mahasiswa.nim,
            jurusan: data.mahasiswa.jurusan,
            program_studi: data.mahasiswa.program_studi,
            nomer_hp: data.mahasiswa.nomer_hp,
            email: data.mahasiswa.email
        },
        dosen: {
            id_dosen: data.dosen.id_dosen,
            nama: data.dosen.nama,
            nidn: data.dosen.nidn,
            email: data.dosen.email,
            nomer_hp: data.dosen.nomer_hp
        },
        reviewer: {
            reviewer1: {
                id_reviewer: data.reviewer[0]?.users?.id || null,
                nama: data.reviewer[0]?.users?.username || null,
                email: data.reviewer[0]?.users?.email || null
            },
            reviewer2: {
                id_reviewer: data.reviewer[1]?.users?.id || null,
                nama: data.reviewer[1]?.users?.username || null,
                email: data.reviewer[1]?.users?.email || null
            }
        }
    }

    return formattedData
}

// Fungsi untuk menetapkan reviewer ke proposal
export async function assignReviewerToProposal(proposalId: string, reviewerAssignments: ReviewerAssignment[]): Promise<void> {
    const supabase = await supabaseServer()
    
    // Hapus reviewer yang ada untuk proposal ini
    const { error: deleteError } = await supabase
        .from("reviewer")
        .delete()
        .eq("id_proposal", proposalId)
    
    if (deleteError) {
        throw deleteError
    }
    
    // Tambahkan reviewer baru jika ada
    if (reviewerAssignments.length > 0) {
        const insertData = reviewerAssignments.map(assignment => ({
            id_proposal: proposalId,
            id_users: assignment.id,
            no: assignment.no
        }))
        
        const { error: insertError } = await supabase
            .from("reviewer")
            .insert(insertData)
        
        if (insertError) {
            throw insertError
        }
    }
}

// Fungsi untuk mengupdate reviewer pada proposal
export async function updateProposalReviewers(proposalId: string, reviewer1Id: string | null, reviewer2Id: string | null): Promise<void> {
    const supabase = await supabaseServer()
    const reviewerAssignments: ReviewerAssignment[] = []
    
    if (reviewer1Id) {
        reviewerAssignments.push({
            id: reviewer1Id,
            no: 1
        })
    }
    
    if (reviewer2Id) {
        reviewerAssignments.push({
            id: reviewer2Id,
            no: 2
        })
    }
    
    await assignReviewerToProposal(proposalId, reviewerAssignments)
}

// Fungsi untuk menghapus proposal
export async function deleteProposal(id: string): Promise<{ success: boolean, message: string }> {
    const supabase = await supabaseServer()
    
    try {
        // Hapus reviewer terlebih dahulu
        const { error: reviewerError } = await supabase
            .from("reviewer")
            .delete()
            .eq("id_proposal", id)
        
        if (reviewerError) {
            return {
                success: false,
                message: `Gagal menghapus reviewer: ${reviewerError.message}`
            }
        }
        
        // Kemudian hapus proposal
        const { error } = await supabase
            .from("proposal")
            .delete()
            .eq("id", id)

        if (error) {
            return {
                success: false,
                message: `Gagal menghapus proposal: ${error.message}`
            }
        }

        return {
            success: true,
            message: "Proposal berhasil dihapus"
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Terjadi kesalahan: ${error.message}`
        }
    }
}

// Interface untuk input data proposal dari spreadsheet
interface ProposalSpreadsheetInput {
  judul: string
  nama_ketua: string 
  nim: string
  jurusan: string
  program_studi: string
  nomer_hp_ketua: string
  email_ketua: string
  nama_dosen: string
  nidn: string
  email_dosen: string
  nomer_hp_dosen: string
  url_file: string
  jumlah_anggota: number
  bidang_pkm_id: string
}

// Fungsi untuk membuat banyak proposal dari data spreadsheet
export async function createProposalsFromSpreadsheet(proposals: ProposalSpreadsheetInput[]): Promise<{ success: boolean, message: string, data?: any[] }> {
  const supabase = await supabaseServer()
  const results: any[] = []
  
  try {
    // Proses setiap proposal satu per satu
    for (const proposal of proposals) {
      // Tambahkan status penilaian default
      const proposalData = {
        ...proposal,
        status_penilaian: "Belum Dinilai"
      }
      
      // Gunakan fungsi RPC yang sudah ada untuk membuat proposal
      const { data, error } = await supabase
        .rpc('create_proposal', {
          bidang_pkm_id: proposalData.bidang_pkm_id,
          email_dosen: proposalData.email_dosen,
          email_ketua: proposalData.email_ketua,
          judul: proposalData.judul,
          jumlah_anggota: proposalData.jumlah_anggota,
          jurusan: proposalData.jurusan,
          nama_dosen: proposalData.nama_dosen,
          nama_ketua: proposalData.nama_ketua,
          nidn: proposalData.nidn,
          nim: proposalData.nim,
          nomer_hp_dosen: proposalData.nomer_hp_dosen,
          nomer_hp_ketua: proposalData.nomer_hp_ketua,
          program_studi: proposalData.program_studi,
          status_penilaian: proposalData.status_penilaian,
          url_file: proposalData.url_file
        })
      
      if (error) {
        // Jika ada error, tambahkan ke hasil dengan status gagal
        results.push({
          data: proposalData,
          success: false,
          error: error.message
        })
      } else {
        // Jika berhasil, tambahkan ke hasil dengan status sukses
        results.push({
          data: data,
          success: true
        })
      }
    }
    
    // Hitung jumlah proposal yang berhasil diimpor
    const successCount = results.filter(r => r.success).length
    
    return {
      success: true,
      message: `Berhasil mengimpor ${successCount} dari ${proposals.length} proposal`,
      data: results
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Terjadi kesalahan saat mengimpor proposal: ${error.message}`,
      data: results
    }
  }
}

import { getAllBidangProposal } from "../proposal-service"
import { supabaseServer } from "@/lib/supabase/server"

// Mock supabaseServer
jest.mock("@/lib/supabase/server", () => ({
  supabaseServer: jest.fn()
}))

describe("getAllBidangProposal", () => {
  // Setup mock data
  const mockBidangPKM = [
    {
      id_bidang_pkm: "1",
      nama: "PKM-P"
    },
    {
      id_bidang_pkm: "2",
      nama: "PKM-K"
    },
    {
      id_bidang_pkm: "3",
      nama: "PKM-M"
    }
  ]

  // Setup mock supabase
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis()
  }

  beforeEach(() => {
    // Reset semua mock
    jest.clearAllMocks()
    
    // Setup mock supabaseServer untuk mengembalikan mockSupabase
    ;(supabaseServer as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("harus mengembalikan daftar bidang PKM yang diformat dengan benar", async () => {
    // Setup mock response
    mockSupabase.order.mockResolvedValueOnce({
      data: mockBidangPKM,
      error: null
    })

    // Panggil fungsi
    const result = await getAllBidangProposal()

    // Verifikasi pemanggilan supabase
    expect(supabaseServer).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith("bidang_pkm")
    expect(mockSupabase.select).toHaveBeenCalledWith(`
      id_bidang_pkm,
      nama
    `)
    expect(mockSupabase.order).toHaveBeenCalledWith("nama", { ascending: true })

    // Verifikasi hasil
    expect(result).toEqual([
      {
        id: "1",
        nama: "PKM-P"
      },
      {
        id: "2",
        nama: "PKM-K"
      },
      {
        id: "3",
        nama: "PKM-M"
      }
    ])
  })

  it("harus mengembalikan array kosong jika tidak ada data", async () => {
    // Setup mock response dengan data kosong
    mockSupabase.order.mockResolvedValueOnce({
      data: [],
      error: null
    })

    // Panggil fungsi
    const result = await getAllBidangProposal()

    // Verifikasi hasil
    expect(result).toEqual([])
  })

  it("harus melempar error jika terjadi kesalahan", async () => {
    // Setup mock error
    const mockError = new Error("Database error")
    mockSupabase.order.mockResolvedValueOnce({
      data: null,
      error: mockError
    })

    // Verifikasi bahwa fungsi melempar error
    await expect(getAllBidangProposal()).rejects.toThrow("Database error")
  })
}) 
"use client"

import { useState, useEffect } from "react"
import { getAllBidangProposal } from "@/services/proposal-service"

export function useBidangProposal() {
  const [data, setData] = useState<{
    id_bidang_pkm: string; id: string; nama: string 
}[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const result = await getAllBidangProposal()
      console.log("Data bidang PKM:", result) // Untuk debugging
      // Transformasi data untuk memastikan struktur yang benar
      const transformedData = result.map((item: any) => ({
        id_bidang_pkm: item.id_bidang_pkm,
        id: item.id,
        nama: item.nama
      }))
      setData(transformedData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Terjadi kesalahan"))
      console.error("Error fetching bidang PKM:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
} 
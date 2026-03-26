"use client"

import { useState, useEffect } from "react"
import { BidangPkmService, BidangPkm } from "@/services/bidang-pkm-service"

export function useBidangProposal() {
  const [data, setData] = useState<BidangPkm[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const result = await BidangPkmService.getAll()
      console.log("Data bidang PKM:", result) // Untuk debugging
      setData(result)
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
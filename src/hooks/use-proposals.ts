"use client"

import { useState, useEffect } from "react"
import { getAllProposals } from "@/services/proposal-service"
import { Proposal } from "@/services/proposal-service"

export function useProposals() {
  const [data, setData] = useState<Proposal[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const result = await getAllProposals()
      setData(result as unknown as Proposal[])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Terjadi kesalahan"))
      console.error("Error fetching proposals:", err)
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
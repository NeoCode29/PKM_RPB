"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Proposal } from "@/services/proposal-service"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Proposal>[] = [
  {
    accessorKey: "judul",
    header: "Judul Proposal",
  },
  {
    accessorKey: "bidang_pkm.nama",
    header: "Bidang PKM",
  },
  {
    accessorKey: "mahasiswa.nama",
    header: "Ketua Pengusul",
  },
  {
    accessorKey: "dosen.nama",
    header: "Dosen Pembimbing",
  },
  {
    accessorKey: "jumlah_anggota",
    header: "Jumlah Anggota",
  },
  {
    accessorKey: "status_penilaian",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status_penilaian") as string
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "default"
      
      if (status === "Belum Dinilai") {
        variant = "secondary"
      } else if (status === "Ditolak") {
        variant = "destructive"
      } else if (status === "Diterima") {
        variant = "default"
      }
      
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Tanggal Dibuat",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return format(new Date(date), "dd MMMM yyyy", { locale: id })
    },
  },
] 
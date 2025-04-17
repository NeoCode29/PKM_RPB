import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { ProposalWithRelations } from '@/services/proposal-service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProposalTableProps {
  proposals: ProposalWithRelations[];
  isLoading?: boolean;
}

// Mapping status ke variant badge
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  'Belum Dinilai': 'secondary',
  'Sedang Ditinjau': 'default',
  'Diterima': 'success',
  'Ditolak': 'destructive'
};

export function ProposalTable({ proposals, isLoading = false }: ProposalTableProps) {
  const router = useRouter();

  // Handle lihat detail proposal
  const handleViewDetail = (id: number) => {
    // Redirect ke halaman detail proposal untuk reviewer menggunakan router Next.js
    router.push(`/reviewer/proposal/${id}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead>Judul Proposal</TableHead>
            <TableHead>Bidang PKM</TableHead>
            <TableHead>Ketua</TableHead>
            <TableHead>Tanggal Submit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : proposals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Tidak ada proposal yang ditugaskan untuk Anda
              </TableCell>
            </TableRow>
          ) : (
            proposals.map((proposal, index) => (
              <TableRow key={proposal.id_proposal}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {proposal.judul}
                </TableCell>
                <TableCell>{proposal.bidang_pkm?.nama || '-'}</TableCell>
                <TableCell>{proposal.mahasiswa?.nama || '-'}</TableCell>
                <TableCell>
                  {format(new Date(proposal.created_at), "dd MMM yyyy", { locale: id })}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[proposal.status_penilaian || ''] || "outline"}>
                    {proposal.status_penilaian || 'Belum Dinilai'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(proposal.id_proposal)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 
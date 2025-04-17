'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { ProposalService } from '@/services/proposal-service';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProposalData {
  id_proposal: number;
  judul: string;
  ketua: string;
  status_penilaian: boolean;
}

interface BidangProposalContentProps {
  userId: string;
  bidangId: number;
}

export function BidangProposalAdministrasiContent({ userId, bidangId }: BidangProposalContentProps) {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchProposals = async () => {
      if (!userId || isNaN(bidangId)) return;

      try {
        const data = await ProposalService.getProposalsByBidangAndReviewer(
          userId,
          bidangId
        );
        setProposals(data);
        setFilteredProposals(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setError('Terjadi kesalahan saat memuat data proposal');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [userId, bidangId]);

  useEffect(() => {
    let result = [...proposals];

    // Filter berdasarkan status
    if (statusFilter !== 'all') {
      const isReviewed = statusFilter === 'reviewed';
      result = result.filter(proposal => proposal.status_penilaian === isReviewed);
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        proposal =>
          proposal.judul.toLowerCase().includes(query) ||
          proposal.ketua.toLowerCase().includes(query)
      );
    }

    setFilteredProposals(result);
  }, [searchQuery, statusFilter, proposals]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari proposal atau ketua..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="reviewed">Sudah Dinilai</SelectItem>
              <SelectItem value="unreviewed">Belum Dinilai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Judul Proposal</TableHead>
              <TableHead className="w-48">Ketua</TableHead>
              <TableHead className="w-32 text-center">Status</TableHead>
              <TableHead className="w-24 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.map((proposal, index) => (
              <TableRow key={proposal.id_proposal}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{proposal.judul}</TableCell>
                <TableCell>{proposal.ketua}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={proposal.status_penilaian ? "success" : "warning"}
                  >
                    {proposal.status_penilaian ? 'Sudah Dinilai' : 'Belum Dinilai'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Link 
                    href={`/reviewer/penilaian-administrasi/${bidangId}/${proposal.id_proposal}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Nilai
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filteredProposals.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Tidak ada proposal yang sesuai dengan filter'
                    : 'Tidak ada proposal yang perlu dinilai'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 
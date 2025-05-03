'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBidangProposals } from '@/hooks/use-penilaian-administrasi';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Eye, 
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { ProposalWithRelations } from '@/services/proposal-service';

// Interface untuk memperluas ProposalWithRelations dengan penilaian_substansi
interface ExtendedProposal extends ProposalWithRelations {
  penilaian_substansi?: {
    id_penilaian_substansi?: number;
    status?: boolean;
    total_nilai?: number;
    updated_at?: string;
  } | null;
}

interface ProposalListSubstansiClientProps {
  bidangId: number;
  userId: string;
}

export function ProposalListSubstansiClient({ bidangId, userId }: ProposalListSubstansiClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Gunakan hook dengan userId dari props
  const { proposals, loading: proposalsLoading, error, refreshProposals } = useBidangProposals(
    userId, 
    bidangId
  );
  
  const [filteredProposals, setFilteredProposals] = useState<ExtendedProposal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bidangName, setBidangName] = useState('');
  
  // Setup filter
  useEffect(() => {
    if (!proposals) return;
    
    if (proposals.length > 0 && proposals[0].bidang_pkm?.nama) {
      setBidangName(proposals[0].bidang_pkm.nama);
    }
    
    let filtered = [...proposals] as ExtendedProposal[];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        p => p.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.mahasiswa?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => {
        // Periksa status penilaian substansi
        const penilaianStatus = p.penilaian_substansi?.status;
        
        if (statusFilter === 'Sudah Dinilai') {
          return penilaianStatus === true;
        } else if (statusFilter === 'Belum Dinilai') {
          return penilaianStatus !== true;
        }
        return true;
      });
    }
    
    setFilteredProposals(filtered);
  }, [proposals, searchQuery, statusFilter]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error in ProposalListSubstansiClient:', error);
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  const handleBack = () => {
    router.push('/reviewer/penilaian-substansi');
  };
  
  const handleViewProposal = (id: number) => {
    router.push(`/reviewer/penilaian-substansi/${bidangId}/${id}`);
  };
  
  const getStatusVariant = (status: boolean | null | undefined) => {
    if (status === true) {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  };
  
  // Fungsi untuk memastikan status penilaian dalam format yang benar
  const formatStatusPenilaian = (status: boolean | null | undefined): string => {
    return status ? 'Sudah Dinilai' : 'Belum Dinilai';
  };
  
  // Tampilkan loading state
  if (proposalsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="rounded-md border p-4">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  // Tampilkan pesan jika tidak ada userId
  if (!userId) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <FileText size={48} className="text-gray-400" />
        </div>
        <CardTitle className="mb-2">Data Tidak Tersedia</CardTitle>
        <CardDescription>
          Tidak dapat memuat data proposal. Silakan coba lagi nanti.
        </CardDescription>
        <CardFooter className="justify-center pt-4">
          <Button onClick={handleBack}>
            Kembali
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            {filteredProposals.length} proposal yang perlu dinilai
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari proposal..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status Penilaian</SelectLabel>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Belum Dinilai">Belum Dinilai</SelectItem>
                <SelectItem value="Sudah Dinilai">Sudah Dinilai</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul Proposal</TableHead>
              <TableHead>Pengusul</TableHead>
              <TableHead>Status Penilaian</TableHead>
              <TableHead>Tanggal Submit</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposalsLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Tidak ada proposal yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal, index) => (
                <TableRow key={proposal.id_proposal}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium max-w-[300px]">
                    {proposal.judul.length > 50 ? `${proposal.judul.substring(0, 47)}...` : proposal.judul}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{proposal.mahasiswa?.nama || '-'}</p>
                      <p className="text-sm text-muted-foreground">
                        {proposal.mahasiswa?.nim || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusVariant(proposal.penilaian_substansi?.status)}
                    >
                      {formatStatusPenilaian(proposal.penilaian_substansi?.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(proposal.created_at), 'dd MMMM yyyy', { locale: id })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProposal(proposal.id_proposal)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Nilai
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
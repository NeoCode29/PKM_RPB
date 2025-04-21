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
  FileText,
  AlertCircle
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProposalWithRelations } from '@/services/proposal-service';

interface ProposalListClientProps {
  bidangId: number;
  userId: string;
}

interface ExtendedProposal extends ProposalWithRelations {
  penilaian_administrasi: {
    status: boolean | null;
    total_kesalahan?: number | null;
  } | null;
  penilaian_substansi: {
    status: boolean | null;
  } | null;
}

export function ProposalListClient({ bidangId, userId }: ProposalListClientProps) {
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
  
  // Setup filter
  useEffect(() => {
    if (!proposals) return;
    
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
        const penilaian = p.penilaian_administrasi;
        
        if (statusFilter === 'Belum Dinilai') {
          return !penilaian || penilaian.status !== true;
        } else if (statusFilter === 'Sudah Dinilai') {
          return penilaian?.status === true;
        }
        return true;
      });
    }
    
    setFilteredProposals(filtered);
  }, [proposals, searchQuery, statusFilter]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error in ProposalListClient:', error);
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  const handleBack = () => {
    router.push('/reviewer/penilaian-administrasi');
  };
  
  const handleViewProposal = (id: number) => {
    router.push(`/reviewer/penilaian-administrasi/${bidangId}/${id}`);
  };
  
  const getStatusVariant = (penilaian: ExtendedProposal['penilaian_administrasi']) => {
    if (!penilaian || penilaian.status !== true) {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800';
    }
    return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800';
  };
  
  const formatStatusPenilaian = (penilaian: ExtendedProposal['penilaian_administrasi']): string => {
    if (!penilaian || penilaian.status !== true) {
      return 'Belum Dinilai';
    }
    return 'Sudah Dinilai';
  };
  
  // Tampilkan loading state
  if (proposalsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6">
          <Skeleton className="h-10 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </div>
        
        <div className="border rounded-lg">
          <div className="p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}
        </AlertDescription>
      </Alert>
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

  // Tampilkan pesan jika tidak ada proposal
  if (!proposals?.length) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <FileText size={48} className="text-gray-400" />
        </div>
        <CardTitle className="mb-2">Tidak Ada Proposal</CardTitle>
        <CardDescription>
          Tidak ada proposal yang perlu dinilai untuk bidang ini
        </CardDescription>
        <CardFooter className="justify-center pt-4">
          <Button onClick={handleBack}>
            Kembali ke Daftar Bidang
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul Proposal</TableHead>
              <TableHead>Ketua</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.map((proposal) => (
              <TableRow key={proposal.id_proposal}>
                <TableCell className="font-medium">{proposal.judul}</TableCell>
                <TableCell>{proposal.mahasiswa?.nama}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={getStatusVariant(proposal.penilaian_administrasi)}
                  >
                    {formatStatusPenilaian(proposal.penilaian_administrasi)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProposal(proposal.id_proposal)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {proposal.penilaian_administrasi?.status === true ? 'Lihat' : 'Nilai'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 

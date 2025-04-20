'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, FileSpreadsheet, Filter } from 'lucide-react';
import { ProposalService, ProposalWithRelations } from '@/services/proposal-service';
import { BidangPkm } from '@/services/proposal-service';

export default function ReportPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalWithRelations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidangList, setBidangList] = useState<BidangPkm[]>([]);
  const [selectedBidang, setSelectedBidang] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch proposals on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch bidang PKM
        const bidangData = await ProposalService.getAllBidangPkm();
        setBidangList(bidangData);
        
        // Fetch all proposals
        const proposalData = await ProposalService.getAll({
          pageSize: 100 // Batasi jumlah proposal yang ditampilkan
        });
        
        if (proposalData && proposalData.data) {
          setProposals(proposalData.data);
          setFilteredProposals(proposalData.data);
        } else {
          setError('Tidak ada data proposal yang ditemukan');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter proposals based on search query and selected bidang
  useEffect(() => {
    if (!proposals.length) return;

    let filtered = [...proposals];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        p => p.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.mahasiswa?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply bidang filter
    if (selectedBidang !== 'all') {
      filtered = filtered.filter(p => p.bidang_pkm?.id_bidang_pkm === parseInt(selectedBidang));
    }
    
    setFilteredProposals(filtered);
  }, [searchQuery, selectedBidang, proposals]);

  // Handle click on proposal to view details
  const handleViewProposal = (id: number) => {
    router.push(`/admin/report/${id}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Laporan Penilaian Proposal</CardTitle>
          <CardDescription>
            Daftar semua proposal dengan hasil penilaian administrasi dan substansi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau nama pengusul..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={selectedBidang}
                onValueChange={setSelectedBidang}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Pilih Bidang PKM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Bidang PKM</SelectLabel>
                    <SelectItem value="all">Semua Bidang</SelectItem>
                    {bidangList.map((bidang) => (
                      <SelectItem 
                        key={bidang.id_bidang_pkm} 
                        value={bidang.id_bidang_pkm.toString()}
                      >
                        {bidang.nama}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/admin/report/download')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Unduh Semua Laporan</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-6">
              {error}
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              Tidak ada proposal yang ditemukan
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Judul Proposal</TableHead>
                    <TableHead>Pengusul</TableHead>
                    <TableHead>Bidang PKM</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((proposal, index) => (
                    <TableRow key={proposal.id_proposal}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium max-w-[300px]">
                        {proposal.judul}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proposal.mahasiswa?.nama || '-'}</p>
                          <p className="text-sm text-muted-foreground">
                            {proposal.mahasiswa?.nim || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{proposal.bidang_pkm?.nama || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProposal(proposal.id_proposal)}
                        >
                          Lihat Laporan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

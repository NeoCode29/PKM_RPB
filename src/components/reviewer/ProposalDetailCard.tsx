'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, User, Building, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProposalDetailCardProps {
  proposal: any;
  showBasicInfoOnly?: boolean;
  showDetailOnly?: boolean;
}

export function ProposalDetailCard({ proposal, showBasicInfoOnly = false, showDetailOnly = false }: ProposalDetailCardProps) {
  if (!proposal) return null;

  const getStatusColor = (status: string | null | boolean) => {
    if (status === true) {
      return 'bg-green-100 text-green-800';
    } else if (status === false) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      switch (status) {
        case 'Diterima':
          return 'bg-green-100 text-green-800';
        case 'Ditolak':
          return 'bg-red-100 text-red-800';
        case 'Sedang Ditinjau':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getStatusText = (status: boolean | null | undefined) => {
    return status === true ? 'Sudah Dinilai' : 'Belum Dinilai';
  };

  // Jika mode showDetailOnly aktif, tampilkan hanya informasi mahasiswa, dosen, dan pendanaan
  if (showDetailOnly) {
    return (
      <div className="space-y-6">
        {/* Info Mahasiswa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Data Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Nama</TableCell>
                  <TableCell>{proposal.mahasiswa?.nama || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">NIM</TableCell>
                  <TableCell>{proposal.mahasiswa?.nim || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Program Studi</TableCell>
                  <TableCell>{proposal.mahasiswa?.program_studi || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jurusan</TableCell>
                  <TableCell>{proposal.mahasiswa?.jurusan || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell>{proposal.mahasiswa?.email || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">No. HP</TableCell>
                  <TableCell>{proposal.mahasiswa?.nomer_hp || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Info Dosen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Data Dosen Pembimbing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Nama</TableCell>
                  <TableCell>{proposal.dosen?.nama || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">NIDN</TableCell>
                  <TableCell>{proposal.dosen?.nidn || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell>{proposal.dosen?.email || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">No. HP</TableCell>
                  <TableCell>{proposal.dosen?.nomer_hp || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Info Pendanaan */}
        {proposal.detail_pendanaan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Data Pendanaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dana Simbelmawa</TableCell>
                    <TableCell>
                      Rp {(proposal.detail_pendanaan.dana_simbelmawa || 0).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Dana Perguruan Tinggi</TableCell>
                    <TableCell>
                      Rp {(proposal.detail_pendanaan.dana_perguruan_tinggi || 0).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Dana Pihak Lain</TableCell>
                    <TableCell>
                      Rp {(proposal.detail_pendanaan.dana_pihak_lain || 0).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Dana</TableCell>
                    <TableCell className="font-semibold">
                      Rp {(
                        (proposal.detail_pendanaan.dana_simbelmawa || 0) +
                        (proposal.detail_pendanaan.dana_perguruan_tinggi || 0) +
                        (proposal.detail_pendanaan.dana_pihak_lain || 0)
                      ).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Jika mode showBasicInfoOnly aktif, tampilkan hanya informasi dasar proposal
  if (showBasicInfoOnly) {
    return (
      <div className="space-y-6">
        {/* Detail Proposal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{proposal.judul}</CardTitle>
            <CardDescription>Bidang: {proposal.bidang_pkm?.nama || '-'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">ID Proposal</TableCell>
                  <TableCell>{proposal.id_proposal}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tanggal Pengajuan</TableCell>
                  <TableCell>
                    {format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: id })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jumlah Anggota</TableCell>
                  <TableCell>{proposal.jumlah_anggota}</TableCell>
                </TableRow>
                {proposal.url_file && (
                  <TableRow>
                    <TableCell className="font-medium">File Proposal</TableCell>
                    <TableCell>
                      <a
                        href={proposal.url_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Download Proposal
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Tampilkan semua informasi (default)
  return (
    <div className="space-y-6">
      {/* Detail Proposal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{proposal.judul}</CardTitle>
          <CardDescription>Bidang: {proposal.bidang_pkm?.nama || '-'}</CardDescription>
          <div className="mt-2">
            <Badge className={getStatusColor(proposal.penilaian_substansi?.status)}>
              {getStatusText(proposal.penilaian_substansi?.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ID Proposal</TableCell>
                <TableCell>{proposal.id_proposal}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Tanggal Pengajuan</TableCell>
                <TableCell>
                  {format(new Date(proposal.created_at), "dd MMMM yyyy", { locale: id })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jumlah Anggota</TableCell>
                <TableCell>{proposal.jumlah_anggota}</TableCell>
              </TableRow>
              {proposal.url_file && (
                <TableRow>
                  <TableCell className="font-medium">File Proposal</TableCell>
                  <TableCell>
                    <a
                      href={proposal.url_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Proposal
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Mahasiswa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Data Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Nama</TableCell>
                <TableCell>{proposal.mahasiswa?.nama || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">NIM</TableCell>
                <TableCell>{proposal.mahasiswa?.nim || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Program Studi</TableCell>
                <TableCell>{proposal.mahasiswa?.program_studi || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jurusan</TableCell>
                <TableCell>{proposal.mahasiswa?.jurusan || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>{proposal.mahasiswa?.email || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">No. HP</TableCell>
                <TableCell>{proposal.mahasiswa?.nomer_hp || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Info Dosen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Data Dosen Pembimbing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Nama</TableCell>
                <TableCell>{proposal.dosen?.nama || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">NIDN</TableCell>
                <TableCell>{proposal.dosen?.nidn || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>{proposal.dosen?.email || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">No. HP</TableCell>
                <TableCell>{proposal.dosen?.nomer_hp || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Info Pendanaan */}
      {proposal.detail_pendanaan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Data Pendanaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Dana Simbelmawa</TableCell>
                  <TableCell>
                    Rp {(proposal.detail_pendanaan.dana_simbelmawa || 0).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dana Perguruan Tinggi</TableCell>
                  <TableCell>
                    Rp {(proposal.detail_pendanaan.dana_perguruan_tinggi || 0).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dana Pihak Lain</TableCell>
                  <TableCell>
                    Rp {(proposal.detail_pendanaan.dana_pihak_lain || 0).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Dana</TableCell>
                  <TableCell className="font-semibold">
                    Rp {(
                      (proposal.detail_pendanaan.dana_simbelmawa || 0) +
                      (proposal.detail_pendanaan.dana_perguruan_tinggi || 0) +
                      (proposal.detail_pendanaan.dana_pihak_lain || 0)
                    ).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
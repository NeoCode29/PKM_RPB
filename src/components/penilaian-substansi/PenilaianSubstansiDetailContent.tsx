'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { usePenilaianSubstansi } from '@/hooks/use-penilaian-substansi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ProposalService } from '@/services/proposal-service';
import { ProposalWithRelations } from '@/services/proposal-service';

interface PenilaianSubstansiDetailContentProps {
  userId: string;
  bidangId: number;
  proposalId: number;
}

export function PenilaianSubstansiDetailContent({ 
  userId, 
  bidangId, 
  proposalId 
}: PenilaianSubstansiDetailContentProps) {
  const [catatan, setCatatan] = useState('');
  const [proposalDetail, setProposalDetail] = useState<ProposalWithRelations | null>(null);
  const { toast } = useToast();

  const {
    isLoading: isPenilaianLoading,
    error: penilaianError,
    penilaianItems,
    existingPenilaian,
    isSaving,
    updateSkor,
    savePenilaian,
  } = usePenilaianSubstansi({
    proposalId,
    bidangId,
    userId,
  });

  useEffect(() => {
    const fetchProposalDetail = async () => {
      try {
        const detail = await ProposalService.getById(proposalId);
        setProposalDetail(detail);
      } catch (error) {
        console.error('Error fetching proposal detail:', error);
      }
    };

    fetchProposalDetail();
  }, [proposalId]);

  useEffect(() => {
    if (existingPenilaian?.penilaian.catatan) {
      setCatatan(existingPenilaian.penilaian.catatan);
    }
  }, [existingPenilaian]);

  const handleSave = async (isFinalized: boolean = false) => {
    try {
      await savePenilaian(isFinalized, catatan);
      toast({
        title: 'Sukses',
        description: 'Penilaian berhasil disimpan',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan penilaian',
        variant: 'destructive',
      });
    }
  };

  if (isPenilaianLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (penilaianError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {penilaianError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Penilaian Substansi Proposal</h1>

      {/* Detail Proposal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detail Proposal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informasi Proposal</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Judul:</span> {proposalDetail?.judul}</p>
                <p><span className="font-medium">Bidang PKM:</span> {proposalDetail?.bidang_pkm.nama}</p>
                <p><span className="font-medium">Status:</span> {proposalDetail?.status_penilaian}</p>
                {proposalDetail?.url_file && (
                  <p>
                    <span className="font-medium">File Proposal:</span>{' '}
                    <a 
                      href={proposalDetail.url_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Lihat File
                    </a>
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Informasi Pengusul</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Ketua:</span> {proposalDetail?.mahasiswa.nama}</p>
                <p><span className="font-medium">NIM:</span> {proposalDetail?.mahasiswa.nim}</p>
                <p><span className="font-medium">Program Studi:</span> {proposalDetail?.mahasiswa.program_studi}</p>
                <p><span className="font-medium">Dosen Pembimbing:</span> {proposalDetail?.dosen.nama}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Penilaian */}
      <div className="space-y-6">
        {penilaianItems.map((item) => (
          <Card key={item.id_kriteria}>
            <CardHeader>
              <CardTitle className="text-lg">{item.deskripsi}</CardTitle>
              <p className="text-sm text-gray-500">Bobot: {item.bobot}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RadioGroup
                  value={item.skor.toString()}
                  onValueChange={(value: string) => updateSkor(item.id_kriteria, parseInt(value))}
                  className="grid grid-cols-7 gap-2"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((skor) => (
                    <div key={skor} className="flex flex-col items-center">
                      <RadioGroupItem
                        value={skor.toString()}
                        id={`skor-${item.id_kriteria}-${skor}`}
                        className="peer"
                      />
                      <Label
                        htmlFor={`skor-${item.id_kriteria}-${skor}`}
                        className="mt-1 text-sm"
                      >
                        {skor}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    Nilai: {item.nilai} (Skor {item.skor} × Bobot {item.bobot})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan penilaian di sini..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Simpan Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Finalisasi Penilaian
          </Button>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePenilaianSubstansi } from '@/hooks/use-penilaian-substansi';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface PenilaianSubstansiClientFormProps {
  userId: string;
  bidangId: number;
  proposalId: number;
}

// Deskripsi skor 1-7
const deskripsiSkor: Record<number, string> = {
  1: "Sangat Kurang",
  2: "Kurang",
  3: "Cukup Kurang",
  4: "Cukup",
  5: "Cukup Baik",
  6: "Baik",
  7: "Sangat Baik"
};

export function PenilaianSubstansiClientForm({ 
  userId, 
  bidangId, 
  proposalId 
}: PenilaianSubstansiClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    isLoading,
    error,
    penilaianItems,
    existingPenilaian,
    isSaving,
    updateSkor,
    savePenilaian,
    catatan,
    setCatatan
  } = usePenilaianSubstansi({
    proposalId,
    bidangId,
    userId,
  });

  const handleSave = async () => {
    try {
      if (!catatan) {
        toast({
          title: 'Peringatan',
          description: 'Mohon isi catatan penilaian',
          variant: 'destructive',
        });
        return;
      }

      // Validasi semua kriteria harus diisi
      const invalidItems = penilaianItems.filter(item => item.skor === 0);
      if (invalidItems.length > 0) {
        toast({
          title: 'Peringatan',
          description: 'Semua kriteria harus diberi skor untuk menyimpan penilaian',
          variant: 'destructive',
        });
        return;
      }

      await savePenilaian(true, catatan);
      toast({
        title: 'Sukses',
        description: 'Penilaian berhasil disimpan',
      });
      
      // Redirect kembali ke halaman daftar proposal setelah berhasil menyimpan
      setTimeout(() => {
        router.push(`/reviewer/penilaian-substansi/${bidangId}`);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan penilaian',
        variant: 'destructive',
      });
    }
  };

  // menghitung total nilai dari semua kriteria
  const totalNilai = penilaianItems.reduce((sum, item) => sum + item.nilai, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Form Penilaian Substansi</span>
            {existingPenilaian && (
              <Badge 
                variant={existingPenilaian.penilaian.status ? "success" : "warning"}
                className={existingPenilaian.penilaian.status ? 
                  "bg-green-100 text-green-800 hover:bg-green-200" : 
                  "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                }
              >
                {existingPenilaian.penilaian.status ? 'Sudah Dinilai' : 'Belum Dinilai'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {penilaianItems.map((item) => (
              <Card key={item.id_kriteria} className="border border-slate-200 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-base">{item.deskripsi}</h3>
                      <p className="text-sm text-muted-foreground">Bobot: {item.bobot}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="w-[200px] text-xs">
                            Berikan skor 1-7 sesuai dengan kualitas kriteria ini. Skor lebih tinggi menunjukkan kualitas yang lebih baik.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <RadioGroup
                      value={item.skor.toString()}
                      onValueChange={(value: string) => updateSkor(item.id_kriteria, parseInt(value))}
                      className="grid grid-cols-7 gap-2"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((skor) => (
                        <div key={skor} className="flex flex-col items-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <RadioGroupItem
                              value={skor.toString()}
                              id={`skor-${item.id_kriteria}-${skor}`}
                              className="peer"
                            />
                            <Label
                              htmlFor={`skor-${item.id_kriteria}-${skor}`}
                              className="text-sm cursor-pointer"
                            >
                              {skor}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <div className="flex justify-end mt-3">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-md">
                        <p className="text-sm font-medium">
                          Nilai: <span className="font-bold">{item.nilai}</span> 
                          <span className="text-xs text-muted-foreground ml-1">
                            (Skor {item.skor || 0} × Bobot {item.bobot})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <Label htmlFor="catatan" className="text-base font-medium">Catatan Penilaian</Label>
              <Textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan penilaian di sini..."
                className="min-h-[120px] mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">Total Nilai: {totalNilai}</p>
              <p className="text-sm text-muted-foreground">
                Hasil perhitungan skor × bobot dari semua kriteria
              </p>
            </div>
            <Button
              className="w-[200px]" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Simpan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
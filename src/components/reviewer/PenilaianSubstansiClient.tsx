'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePenilaianSubstansi } from '@/hooks/use-penilaian-substansi';

interface PenilaianSubstansiClientFormProps {
  userId: string;
  bidangId: number;
  proposalId: number;
}

export function PenilaianSubstansiClientForm({ 
  userId, 
  bidangId, 
  proposalId 
}: PenilaianSubstansiClientFormProps) {
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
          <CardTitle>Form Penilaian Substansi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {penilaianItems.map((item) => (
            <div key={item.id_kriteria} className="space-y-4">
              <div>
                <h3 className="font-medium">{item.deskripsi}</h3>
                <p className="text-sm text-gray-500">Bobot: {item.bobot}</p>
              </div>
              
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
              
              <hr className="my-4" />
            </div>
          ))}

          <div className="space-y-4">
            <div>
              <Label htmlFor="catatan">Catatan Penilaian</Label>
              <Textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan penilaian di sini..."
                className="min-h-[100px] mt-2"
              />
            </div>
          </div>
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
  );
} 
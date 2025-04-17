'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePenilaianAdministrasi } from '@/hooks/use-penilaian-administrasi';
import { useToast } from '@/components/ui/use-toast';
import { KriteriaAdministrasi } from '@/services/kriteria-administrasi-service';
import { PenilaianAdministrasiService, PenilaianAdministrasiInput } from '@/services/penilaian-administrasi-service';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  ClipboardCheck, 
  Loader2 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface PenilaianAdministrasiFormProps {
  proposalId: number;
  bidangId: number;
  userId: string;
}

export function PenilaianAdministrasiForm({ proposalId, bidangId, userId }: PenilaianAdministrasiFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    penilaian,
    kriteria,
    penilaianItems,
    catatan,
    loading,
    error,
    handleToggleKesalahan,
    handleCatatanChange,
    refreshPenilaian
  } = usePenilaianAdministrasi(userId, proposalId);
  
  const [penilaianItemsState, setPenilaianItems] = useState<Array<{
    id_kriteria: number;
    kesalahan: boolean;
  }>>([]);
  
  // Handle penilaian error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const input: PenilaianAdministrasiInput = {
        id_reviewer: userId,
        id_proposal: proposalId,
        details: penilaianItems.map(item => ({
          id_kriteria: item.id_kriteria,
          kesalahan: item.kesalahan
        })),
        catatan,
        isFinalized: true
      };

      if (penilaian) {
        await PenilaianAdministrasiService.updatePenilaian(penilaian.penilaian.id_penilaian_administrasi, input);
      } else {
        await PenilaianAdministrasiService.createPenilaian(input);
      }

      toast({
        title: 'Sukses',
        description: 'Penilaian berhasil disimpan',
      });

      refreshPenilaian();
      
      // Redirect back to the proposal list
      setTimeout(() => {
        router.push(`/reviewer/penilaian-administrasi/${bidangId}`);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan penilaian',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const jumlahKesalahan = penilaianItems.filter(item => item.kesalahan).length;
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Penilaian Administrasi</CardTitle>
          <CardDescription>Memuat data penilaian...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Penilaian Administrasi</CardTitle>
        <CardDescription>
          Centang kotak jika terdapat kesalahan sesuai kriteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kriteria.map((item: KriteriaAdministrasi) => {
            const penilaianItem = penilaianItems.find(p => p.id_kriteria === item.id_kriteria);
            const isChecked = penilaianItem ? penilaianItem.kesalahan : false;
            
            return (
              <div key={item.id_kriteria} className="flex items-start space-x-3">
                <Checkbox 
                  id={`kriteria-${item.id_kriteria}`} 
                  checked={isChecked}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    handleToggleKesalahan(item.id_kriteria, checked === true);
                  }}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`kriteria-${item.id_kriteria}`}
                    className="leading-tight cursor-pointer"
                  >
                    {item.deskripsi}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h3 className="mb-2 font-medium">Catatan Penilaian:</h3>
          <Textarea
            placeholder="Masukkan catatan penilaian administrasi di sini..."
            className="min-h-[120px]"
            value={catatan}
            onChange={(e) => handleCatatanChange(e.target.value)}
          />
        </div>

        {penilaian && (
          <Alert className="mt-4">
            <AlertTitle>Status Penilaian</AlertTitle>
            <AlertDescription>
              {penilaian.penilaian.status ? (
                <div className="space-y-2">
                  <span className="text-green-600 font-medium">Sudah Dinilai</span>
                  <div className="text-sm text-muted-foreground">
                    Total Kesalahan: {penilaian.penilaian.total_kesalahan || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Terakhir diperbarui: {new Date(penilaian.penilaian.updated_at || '').toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ) : (
                <span className="text-yellow-600 font-medium">Belum Dinilai</span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSubmit}
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian'}
        </Button>
      </CardFooter>
    </Card>
  );
} 
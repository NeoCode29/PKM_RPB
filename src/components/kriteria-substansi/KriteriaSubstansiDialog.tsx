'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KriteriaSubstansi } from '@/services/kriteria-substansi-service';

interface KriteriaSubstansiDialogProps {
  kriteria: KriteriaSubstansi | null;
  bidangPkmName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { deskripsi: string, bobot: number }, id?: number) => Promise<void>;
  mode: 'create' | 'edit';
}

export const KriteriaSubstansiDialog: React.FC<KriteriaSubstansiDialogProps> = ({
  kriteria,
  bidangPkmName,
  open,
  onOpenChange,
  onSave,
  mode
}) => {
  const [deskripsi, setDeskripsi] = useState('');
  const [bobot, setBobot] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kriteria && mode === 'edit') {
      setDeskripsi(kriteria.deskripsi || '');
      setBobot(kriteria.bobot || 0);
    } else {
      setDeskripsi('');
      setBobot(0);
    }
    
    // Reset error state when dialog opens/closes
    setError(null);
  }, [kriteria, mode, open]);

  const handleSave = async () => {
    if (!deskripsi.trim()) {
      setError('Deskripsi kriteria tidak boleh kosong');
      return;
    }

    if (bobot <= 0) {
      setError('Bobot harus lebih besar dari 0');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await onSave(
        { deskripsi: deskripsi.trim(), bobot },
        mode === 'edit' && kriteria ? kriteria.id_kriteria : undefined
      );
      
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving kriteria:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan kriteria');
    } finally {
      setIsSaving(false);
    }
  };

  const dialogTitle = mode === 'create' 
    ? `Tambah Kriteria Substansi ${bidangPkmName ? `- ${bidangPkmName}` : ''}`
    : `Edit Kriteria Substansi ${bidangPkmName ? `- ${bidangPkmName}` : ''}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="deskripsi">Deskripsi Kriteria</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={5}
              placeholder="Masukkan deskripsi kriteria substansi..."
              className={error && !deskripsi.trim() ? 'border-red-500' : ''}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bobot">Bobot</Label>
            <Input
              id="bobot"
              type="number"
              min="1"
              value={bobot}
              onChange={(e) => setBobot(parseInt(e.target.value) || 0)}
              className={error && bobot <= 0 ? 'border-red-500' : ''}
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
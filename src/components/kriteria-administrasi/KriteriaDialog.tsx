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
import { Label } from '@/components/ui/label';
import { KriteriaAdministrasi, KriteriaAdministrasiInput } from '@/services/kriteria-administrasi-service';

interface KriteriaDialogProps {
  kriteria: KriteriaAdministrasi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: KriteriaAdministrasiInput, id?: number) => Promise<void>;
  mode: 'create' | 'edit';
}

export const KriteriaDialog: React.FC<KriteriaDialogProps> = ({
  kriteria,
  open,
  onOpenChange,
  onSave,
  mode
}) => {
  const [deskripsi, setDeskripsi] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kriteria && mode === 'edit') {
      setDeskripsi(kriteria.deskripsi || '');
    } else {
      setDeskripsi('');
    }
    
    // Reset error state when dialog opens/closes
    setError(null);
  }, [kriteria, mode, open]);

  const handleSave = async () => {
    if (!deskripsi.trim()) {
      setError('Deskripsi kriteria tidak boleh kosong');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await onSave(
        { deskripsi: deskripsi.trim() },
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

  const dialogTitle = mode === 'create' ? 'Tambah Kriteria Administrasi' : 'Edit Kriteria Administrasi';

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
              placeholder="Masukkan deskripsi kriteria administrasi..."
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
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
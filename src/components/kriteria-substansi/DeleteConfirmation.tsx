'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KriteriaSubstansi } from '@/services/kriteria-substansi-service';
import { Badge } from '@/components/ui/badge';

interface DeleteConfirmationProps {
  kriteria: KriteriaSubstansi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: number) => Promise<void>;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  kriteria,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!kriteria) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(kriteria.id_kriteria);
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting kriteria:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus kriteria');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!kriteria) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus Kriteria</DialogTitle>
        </DialogHeader>
        <div>
          <p>Apakah Anda yakin ingin menghapus kriteria ini?</p>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Deskripsi:</span>
              <Badge variant="secondary">Bobot: {kriteria.bobot}</Badge>
            </div>
            <p className="break-words whitespace-pre-wrap">{kriteria.deskripsi}</p>
          </div>
          {error && (
            <div className="mt-2 p-2 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>Batal</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
'use client';

import React, { useState } from 'react';
import { useKriteriaAdministrasi } from '@/hooks/use-kriteria-administrasi';
import { KriteriaTable } from '@/components/kriteria-administrasi/KriteriaTable';
import { KriteriaDialog } from '@/components/kriteria-administrasi/KriteriaDialog';
import { DeleteConfirmation } from '@/components/kriteria-administrasi/DeleteConfirmation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KriteriaAdministrasi, KriteriaAdministrasiInput } from '@/services/kriteria-administrasi-service';
import { useToast } from '@/components/ui/use-toast';

export function KriteriaAdministrasiManagement() {
  const { kriteria, loading, error, createKriteria, updateKriteria, deleteKriteria, refreshKriteria } = useKriteriaAdministrasi();
  const [selectedKriteria, setSelectedKriteria] = useState<KriteriaAdministrasi | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEdit = (kriteria: KriteriaAdministrasi) => {
    setSelectedKriteria(kriteria);
    setEditDialogOpen(true);
  };

  const handleDelete = (kriteria: KriteriaAdministrasi) => {
    setSelectedKriteria(kriteria);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: KriteriaAdministrasiInput, id?: number) => {
    try {
      if (id) {
        await updateKriteria(id, data);
        toast({
          title: 'Kriteria berhasil diperbarui',
          description: 'Perubahan telah disimpan',
        });
      } else {
        await createKriteria(data);
        toast({
          title: 'Kriteria berhasil ditambahkan',
          description: 'Kriteria baru telah ditambahkan',
        });
      }
    } catch (error) {
      toast({
        title: 'Gagal menyimpan kriteria',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan kriteria',
        variant: 'destructive',
      });
      throw error; // Re-throw untuk ditangkap oleh dialog
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteKriteria(id);
      toast({
        title: 'Kriteria berhasil dihapus',
      });
    } catch (error) {
      toast({
        title: 'Gagal menghapus kriteria',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus kriteria',
        variant: 'destructive',
      });
      throw error; // Re-throw untuk ditangkap oleh dialog
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kriteria Administrasi</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kriteria
        </Button>
      </div>

      {error ? (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          Error: {error.message}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <KriteriaTable
          kriteria={kriteria}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <KriteriaDialog
        kriteria={null}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleSave}
        mode="create"
      />

      <KriteriaDialog
        kriteria={selectedKriteria}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
        mode="edit"
      />

      <DeleteConfirmation
        kriteria={selectedKriteria}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
} 
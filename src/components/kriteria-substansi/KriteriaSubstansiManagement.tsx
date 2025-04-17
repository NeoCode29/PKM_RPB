'use client';

import React, { useState, useEffect } from 'react';
import { useBidangPkm } from '@/hooks/use-bidang-pkm';
import { useKriteriaSubstansi } from '@/hooks/use-kriteria-substansi';
import { BidangPkmTabs } from '@/components/kriteria-substansi/BidangPkmTabs';
import { KriteriaSubstansiTable } from '@/components/kriteria-substansi/KriteriaSubstansiTable';
import { KriteriaSubstansiDialog } from '@/components/kriteria-substansi/KriteriaSubstansiDialog';
import { DeleteConfirmation } from '@/components/kriteria-substansi/DeleteConfirmation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KriteriaSubstansi } from '@/services/kriteria-substansi-service';
import { useToast } from '@/components/ui/use-toast';

export function KriteriaSubstansiManagement() {
  const { bidangPkm, loading: loadingBidang } = useBidangPkm();
  const [activeBidangId, setActiveBidangId] = useState<number | null>(null);
  const [selectedKriteria, setSelectedKriteria] = useState<KriteriaSubstansi | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Set initial active bidang after data is loaded
  useEffect(() => {
    if (bidangPkm.length > 0 && activeBidangId === null) {
      setActiveBidangId(bidangPkm[0].id_bidang_pkm);
    }
  }, [bidangPkm, activeBidangId]);

  const { 
    kriteria, 
    loading: loadingKriteria, 
    error, 
    createKriteria, 
    updateKriteria, 
    deleteKriteria 
  } = useKriteriaSubstansi(activeBidangId);

  const getActiveBidangName = () => {
    if (!activeBidangId) return null;
    const bidang = bidangPkm.find(b => b.id_bidang_pkm === activeBidangId);
    return bidang?.nama || null;
  };

  const handleChangeBidang = (bidangId: number) => {
    setActiveBidangId(bidangId);
  };

  const handleEdit = (kriteria: KriteriaSubstansi) => {
    setSelectedKriteria(kriteria);
    setEditDialogOpen(true);
  };

  const handleDelete = (kriteria: KriteriaSubstansi) => {
    setSelectedKriteria(kriteria);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: { deskripsi: string, bobot: number }, id?: number) => {
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

  const loading = loadingBidang || loadingKriteria;

  if (loadingBidang) {
    return (
      <div className="flex justify-center my-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kriteria Substansi</h1>
        {activeBidangId && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kriteria
          </Button>
        )}
      </div>

      {error ? (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          Error: {error.message}
        </div>
      ) : null}

      <BidangPkmTabs
        bidangList={bidangPkm}
        activeBidang={activeBidangId}
        onChangeBidang={handleChangeBidang}
      >
        {(bidangPkmId, bidangName) => (
          <div>
            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <KriteriaSubstansiTable
                kriteria={kriteria}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </BidangPkmTabs>

      <KriteriaSubstansiDialog
        kriteria={null}
        bidangPkmName={getActiveBidangName()}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleSave}
        mode="create"
      />

      <KriteriaSubstansiDialog
        kriteria={selectedKriteria}
        bidangPkmName={getActiveBidangName()}
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
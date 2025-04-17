'use client';

import React from 'react';
import { KriteriaAdministrasi } from '@/services/kriteria-administrasi-service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface KriteriaTableProps {
  kriteria: KriteriaAdministrasi[];
  onEdit: (kriteria: KriteriaAdministrasi) => void;
  onDelete: (kriteria: KriteriaAdministrasi) => void;
}

export const KriteriaTable: React.FC<KriteriaTableProps> = ({
  kriteria,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString || '-';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Dibuat Pada</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kriteria.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                Belum ada data kriteria administrasi
              </TableCell>
            </TableRow>
          ) : (
            kriteria.map((item) => (
              <TableRow key={item.id_kriteria}>
                <TableCell className="font-medium">{item.id_kriteria}</TableCell>
                <TableCell className="whitespace-pre-wrap">{item.deskripsi || '-'}</TableCell>
                <TableCell>{formatDate(item.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(item)}
                      title="Edit Kriteria"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(item)}
                      title="Hapus Kriteria"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 
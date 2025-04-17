"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProposalWithRelations } from "@/services/proposal-service";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: ProposalWithRelations | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  proposal,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus Proposal</DialogTitle>
          <DialogDescription>
            Anda yakin ingin menghapus proposal{' '}
            <span className="font-semibold">"{proposal?.judul}"</span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <p className="text-sm text-muted-foreground">
            Tindakan ini tidak dapat dibatalkan dan akan menghapus:
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
            <li>Data proposal</li>
            <li>Detail pendanaan</li>
            <li>Penugasan reviewer</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
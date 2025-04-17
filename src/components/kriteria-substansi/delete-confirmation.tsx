"use client"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  title = "Hapus Kriteria Substansi",
  description = "Apakah Anda yakin ingin menghapus kriteria substansi ini? Tindakan ini tidak dapat dibatalkan.",
  isLoading = false,
}: DeleteConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!isLoading) {
      setIsDeleting(true);
      try {
        await onConfirm();
        onOpenChange(false);
      } catch (error) {
        console.error("Error during deletion:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const isProcessing = isLoading || isDeleting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
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
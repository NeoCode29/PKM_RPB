"use client"

import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KriteriaSubstansi } from "@/app/admin/kriteria-substansi/utils";
import { Loader2 } from "lucide-react";

interface KriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (deskripsi: string, bobot: number) => Promise<void>;
  selectedKriteria: KriteriaSubstansi | null;
  mode: "add" | "edit";
  isLoading?: boolean;
}

export function KriteriaSubstansiDialog({
  open,
  onOpenChange,
  onSave,
  selectedKriteria,
  mode,
  isLoading = false,
}: KriteriaDialogProps) {
  const [deskripsi, setDeskripsi] = useState(selectedKriteria?.deskripsi || "");
  const [bobot, setBobot] = useState<number>(selectedKriteria?.bobot || 0);
  const [isSaving, setIsSaving] = useState(false);

  // Update form when selectedKriteria changes or dialog opens
  useEffect(() => {
    if (open) {
      setDeskripsi(selectedKriteria?.deskripsi || "");
      setBobot(selectedKriteria?.bobot || 0);
    }
  }, [selectedKriteria, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDeskripsi("");
      setBobot(0);
    }
  }, [open]);

  const handleSave = async () => {
    if (!deskripsi.trim() || bobot <= 0) return;
    
    if (!isLoading) {
      setIsSaving(true);
      try {
        await onSave(deskripsi, bobot);
        setDeskripsi(""); // Reset form after save
        setBobot(0);
        onOpenChange(false);
      } catch (error) {
        console.error("Error saving kriteria:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeskripsiChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDeskripsi(e.target.value);
  };

  const handleBobotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBobot(isNaN(value) ? 0 : value);
  };

  const buttonDisabled = isLoading || isSaving || !deskripsi.trim() || bobot <= 0;
  const isProcessing = isLoading || isSaving;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isProcessing) {
          setDeskripsi("");
          setBobot(0);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Kriteria Substansi" : "Edit Kriteria Substansi"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Tambahkan kriteria substansi baru ke dalam sistem."
              : "Perbarui informasi kriteria substansi yang sudah ada."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi Kriteria</Label>
            <Textarea
              id="deskripsi"
              placeholder="Masukkan deskripsi kriteria..."
              value={deskripsi}
              onChange={handleDeskripsiChange}
              rows={4}
              className="resize-none"
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bobot">Bobot</Label>
            <Input
              id="bobot"
              type="number"
              min="0"
              step="0.1"
              placeholder="Masukkan bobot kriteria..."
              value={bobot || ""}
              onChange={handleBobotChange}
              disabled={isProcessing}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={buttonDisabled}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
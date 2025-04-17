"use client"

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileWarning, FileSpreadsheet, Download } from "lucide-react";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<number>;
  onDownloadTemplate: () => Promise<void>;
  isLoading?: boolean;
}

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  onDownloadTemplate,
  isLoading = false,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFile(null);
      setError(null);
    }
    onOpenChange(newOpen);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file type
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Format file tidak valid. Harap pilih file Excel (.xlsx, .xls) atau CSV.");
      setFile(null);
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };
  
  // Handle file import
  const handleImport = async () => {
    if (!file) {
      setError("Silahkan pilih file terlebih dahulu.");
      return;
    }
    
    try {
      await onImport(file);
      handleOpenChange(false);
    } catch (err) {
      console.error("Error importing file:", err);
      setError("Terjadi kesalahan saat mengimpor data. Silahkan periksa format file.");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Data Proposal</DialogTitle>
          <DialogDescription>
            Upload file Excel atau CSV yang berisi data proposal untuk diimpor ke dalam sistem.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onDownloadTemplate}
              className="mr-auto"
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file-upload">File Spreadsheet</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="ml-auto">{(file.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <FileWarning className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengimpor...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
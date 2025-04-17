"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileUp, 
  Loader2, 
  Plus, 
  Search,
  Download 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalTable } from "@/components/proposal/proposal-table";
import { ProposalDialog } from "@/components/proposal/proposal-dialog";
import { DeleteConfirmation } from "@/components/proposal/delete-confirmation";
import { ImportDialog } from "@/components/proposal/import-dialog";
import { useProposals } from "@/hooks/use-proposals";
import { Pagination } from "@/components/ui/pagination";

export default function ProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State untuk dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  
  // State untuk filter pencarian
  const [searchQuery, setSearchQuery] = useState("");
  
  // Gunakan hook useProposals untuk manajemen proposal
  const {
    proposals,
    loading,
    error,
    filter,
    pagination,
    updateFilter,
    changePage,
    changePageSize,
    fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal,
    importProposals,
    exportProposals,
    downloadImportTemplate,
    options
  } = useProposals();
  
  // Handler untuk pencarian
  const handleSearch = () => {
    updateFilter({ search: searchQuery });
  };
  
  // Handler untuk filter bidang PKM
  const handleBidangChange = (value: string) => {
    if (value === "all") {
      updateFilter({ bidang_pkm_id: undefined });
    } else {
      updateFilter({ bidang_pkm_id: parseInt(value) });
    }
  };
  
  // Handler untuk tambah proposal
  const handleAddNew = () => {
    setSelectedProposal(null);
    setDialogMode('add');
    setOpenDialog(true);
  };
  
  // Handler untuk edit proposal
  const handleEdit = (proposal: any) => {
    setSelectedProposal(proposal);
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Handler untuk lihat detail proposal
  const handleView = (proposal: any) => {
    router.push(`/admin/proposal/${proposal.id_proposal}`);
  };
  
  // Handler untuk hapus proposal
  const handleDelete = (proposal: any) => {
    setSelectedProposal(proposal);
    setOpenDeleteDialog(true);
  };
  
  // Handler untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (selectedProposal) {
      try {
        await deleteProposal(selectedProposal.id_proposal);
        setOpenDeleteDialog(false);
      } catch (err) {
        console.error("Error deleting proposal:", err);
      }
    }
  };
  
  // Handler untuk save proposal
  const handleSaveProposal = async (data: any, mode: 'add' | 'edit') => {
    try {
      if (mode === 'add') {
        await createProposal(data);
        setOpenDialog(false);
      } else if (mode === 'edit' && selectedProposal) {
        await updateProposal(selectedProposal.id_proposal, data);
        setOpenDialog(false);
      }
    } catch (err) {
      console.error("Error saving proposal:", err);
    }
  };
  
  // Handler untuk import proposal
  const handleImport = async (file: File) => {
    return await importProposals(file);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Proposal</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenImportDialog(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          
          <Button variant="outline" onClick={exportProposals}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Proposal
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter dan Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter proposal berdasarkan judul atau bidang PKM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari judul proposal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select 
              value={filter.bidang_pkm_id?.toString() || "all"} 
              onValueChange={handleBidangChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Bidang PKM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bidang</SelectItem>
                {options.bidang.map((bidang) => (
                  <SelectItem 
                    key={bidang.id_bidang_pkm} 
                    value={bidang.id_bidang_pkm.toString()}
                  >
                    {bidang.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Proposal</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ProposalTable
              data={proposals}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              isLoading={loading}
              totalCount={pagination.count}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between flex-col md:flex-row">
          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages}
            totalItems={pagination.count}
            pageSize={pagination.pageSize}
            onPageChange={changePage}
            onPageSizeChange={changePageSize}
          />
        </CardFooter>
      </Card>
      
      {/* Dialog untuk tambah/edit proposal */}
      <ProposalDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        mode={dialogMode}
        proposal={selectedProposal}
        bidangOptions={options.bidang}
        reviewerOptions={options.reviewers}
        onSave={handleSaveProposal}
        isLoading={loading}
      />
      
      {/* Dialog konfirmasi hapus */}
      <DeleteConfirmation
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        proposal={selectedProposal}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
      
      {/* Dialog import proposal */}
      <ImportDialog
        open={openImportDialog}
        onOpenChange={setOpenImportDialog}
        onImport={handleImport}
        onDownloadTemplate={downloadImportTemplate}
        isLoading={loading}
      />
    </div>
  );
} 
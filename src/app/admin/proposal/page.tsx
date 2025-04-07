"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/proposal/data-table"
import { columns } from "@/components/proposal/columns"
import { ProposalDialog } from "@/components/proposal/proposal-dialog"
import { useProposals } from "@/hooks/use-proposals"
import { Proposal } from "@/services/proposal-service"

export default function ProposalPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useProposals()

  const handleAdd = () => {
    setSelectedProposal(null)
    setIsAddDialogOpen(true)
  }

  const handleEdit = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsEditDialogOpen(true)
  }

  const handleInfo = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsInfoDialogOpen(true)
  }

  const handleDelete = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Proposal</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Proposal
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data || []} 
        isLoading={isLoading}
        onEdit={handleEdit}
        onInfo={handleInfo}
        onDelete={handleDelete}
      />

      {/* Dialog untuk menambah proposal */}
      <ProposalDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="add"
        proposal={null}
        onSuccess={() => {
          setIsAddDialogOpen(false)
          refetch()
        }}
      />

      {/* Dialog untuk mengedit proposal */}
      <ProposalDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        proposal={selectedProposal}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          refetch()
        }}
      />

      {/* Dialog untuk melihat detail proposal */}
      <ProposalDialog
        open={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        mode="info"
        proposal={selectedProposal}
        onSuccess={() => {
          setIsInfoDialogOpen(false)
        }}
      />

      {/* Dialog untuk konfirmasi penghapusan */}
      <ProposalDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        mode="delete"
        proposal={selectedProposal}
        onSuccess={() => {
          setIsDeleteDialogOpen(false)
          refetch()
        }}
      />
    </div>
  )
}

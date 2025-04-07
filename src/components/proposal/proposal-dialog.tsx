"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Proposal, ProposalInput, createProposal, deleteProposal, updateProposal } from "@/services/proposal-service"
import { useBidangProposal } from "@/hooks/use-bidang-proposal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
  judul: z.string().min(1, "Judul harus diisi"),
  nama_ketua: z.string().min(1, "Nama ketua harus diisi"),
  nim: z.string().min(1, "NIM harus diisi"),
  jurusan: z.string().min(1, "Jurusan harus diisi"),
  program_studi: z.string().min(1, "Program studi harus diisi"),
  nomer_hp_ketua: z.string().min(1, "Nomor HP ketua harus diisi"),
  email_ketua: z.string().email("Email tidak valid"),
  nama_dosen: z.string().min(1, "Nama dosen harus diisi"),
  nidn: z.string().min(1, "NIDN harus diisi"),
  email_dosen: z.string().email("Email tidak valid"),
  nomer_hp_dosen: z.string().min(1, "Nomor HP dosen harus diisi"),
  url_file: z.string().min(1, "URL file harus diisi"),
  jumlah_anggota: z.coerce.number().min(1, "Jumlah anggota minimal 1"),
  id_bidang_pkm: z.string().min(1, "Bidang PKM harus dipilih"),
})

interface ProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "info" | "delete"
  proposal: Proposal | null
  onSuccess: () => void
}

export function ProposalDialog({
  open,
  onOpenChange,
  mode,
  proposal,
  onSuccess,
}: ProposalDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: bidangData } = useBidangProposal()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: proposal?.judul || "",
      nama_ketua: proposal?.mahasiswa?.nama || "",
      nim: proposal?.mahasiswa?.nim || "",
      jurusan: proposal?.mahasiswa?.jurusan || "",
      program_studi: proposal?.mahasiswa?.program_studi || "",
      nomer_hp_ketua: proposal?.mahasiswa?.nomer_hp || "",
      email_ketua: proposal?.mahasiswa?.email || "",
      nama_dosen: proposal?.dosen?.nama || "",
      nidn: proposal?.dosen?.nidn || "",
      email_dosen: proposal?.dosen?.email || "",
      nomer_hp_dosen: proposal?.dosen?.nomer_hp || "",
      url_file: proposal?.url_file || "",
      jumlah_anggota: proposal?.jumlah_anggota || 1,
      id_bidang_pkm: proposal?.bidang_pkm?.id_bidang_pkm || "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      
      if (mode === "add") {
        await createProposal({
          ...values,
          status_penilaian: "Belum Dinilai"
        })
        toast.success("Proposal berhasil ditambahkan")
      } else if (mode === "edit" && proposal) {
        await updateProposal(proposal.id, {
          ...values,
          status_penilaian: proposal.status_penilaian
        })
        toast.success("Proposal berhasil diperbarui")
      }
      
      onSuccess()
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!proposal) return
    
    try {
      setIsLoading(true)
      await deleteProposal(proposal.id)
      toast.success("Proposal berhasil dihapus")
      onSuccess()
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus proposal")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (mode === "info" && proposal) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Informasi Proposal</h3>
            <p className="text-sm text-gray-500">{proposal.judul}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Ketua Pengusul</h3>
            <p className="text-sm text-gray-500">{proposal.mahasiswa?.nama}</p>
            <p className="text-sm text-gray-500">{proposal.mahasiswa?.nim}</p>
            <p className="text-sm text-gray-500">{proposal.mahasiswa?.jurusan}</p>
            <p className="text-sm text-gray-500">{proposal.mahasiswa?.program_studi}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Dosen Pembimbing</h3>
            <p className="text-sm text-gray-500">{proposal.dosen?.nama}</p>
            <p className="text-sm text-gray-500">{proposal.dosen?.nidn}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Informasi Lainnya</h3>
            <p className="text-sm text-gray-500">Bidang PKM: {proposal.bidang_pkm?.nama}</p>
            <p className="text-sm text-gray-500">Jumlah Anggota: {proposal.jumlah_anggota}</p>
            <p className="text-sm text-gray-500">Status: {proposal.status_penilaian}</p>
          </div>
        </div>
      )
    }
    
    if (mode === "delete") {
      return (
        <div className="space-y-4">
          <p>Apakah Anda yakin ingin menghapus proposal ini?</p>
          <p className="text-sm text-gray-500">{proposal?.judul}</p>
        </div>
      )
    }
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="judul"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Proposal</FormLabel>
                <FormControl>
                  <Input {...field} disabled={mode === "info"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nama_ketua"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Ketua</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIM</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jurusan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jurusan</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="program_studi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Studi</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nomer_hp_ketua"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor HP Ketua</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email_ketua"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Ketua</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nama_dosen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Dosen</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nidn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIDN</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nomer_hp_dosen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor HP Dosen</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email_dosen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Dosen</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="url_file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL File</FormLabel>
                <FormControl>
                  <Input {...field} disabled={mode === "info"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jumlah_anggota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Anggota</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={mode === "info"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="id_bidang_pkm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bidang PKM</FormLabel>
                  <Select 
                    disabled={mode === "info"} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bidang PKM" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {bidangData?.map((bidang) => (
                        <SelectItem key={bidang.id_bidang_pkm} value={bidang.id_bidang_pkm}>
                          {bidang.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : mode === "add" ? "Tambah" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Proposal" : 
             mode === "edit" ? "Edit Proposal" : 
             mode === "info" ? "Detail Proposal" : 
             "Hapus Proposal"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Tambahkan proposal baru" : 
             mode === "edit" ? "Edit informasi proposal" : 
             mode === "info" ? "Lihat detail proposal" : 
             "Konfirmasi penghapusan proposal"}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
        
        {mode === "delete" && (
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Hapus"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 
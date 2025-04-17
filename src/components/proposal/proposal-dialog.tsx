"use client"

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  BidangPkm, 
  ProposalWithRelations, 
  ProposalInput, 
  User 
} from "@/services/proposal-service";
import { Loader2, UserCheck, UserCircle, Wallet, FileBox, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Schema validasi untuk form proposal
const proposalSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  
  // Data mahasiswa
  nama_mahasiswa: z.string().min(3, "Nama ketua minimal 3 karakter"),
  nim: z.string().min(5, "NIM minimal 5 karakter"),
  program_studi: z.string().min(2, "Program studi harus diisi"),
  jurusan: z.string().min(2, "Jurusan harus diisi"),
  nomer_hp_mahasiswa: z.string().min(10, "Nomor HP minimal 10 karakter"),
  email_mahasiswa: z.string().email("Email tidak valid"),
  
  // Data dosen
  nama_dosen: z.string().min(3, "Nama dosen minimal 3 karakter"),
  nidn: z.string().min(5, "NIDN minimal 5 karakter"),
  email_dosen: z.string().email("Email tidak valid"),
  nomer_hp_dosen: z.string().min(10, "Nomor HP minimal 10 karakter"),
  
  // Data proposal
  url_file: z.string().optional(),
  jumlah_anggota: z.coerce.number().min(1, "Jumlah anggota minimal 1"),
  id_bidang_pkm: z.coerce.number().positive("Bidang PKM harus dipilih"),
  status_penilaian: z.string().optional(),
  
  // Data pendanaan
  dana_simbelmawa: z.coerce.number().min(0, "Nilai tidak boleh negatif").optional(),
  dana_perguruan_tinggi: z.coerce.number().min(0, "Nilai tidak boleh negatif").optional(),
  dana_pihak_lain: z.coerce.number().min(0, "Nilai tidak boleh negatif").optional(),
  
  // Data reviewer
  reviewer1_id: z.string().optional(),
  reviewer2_id: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

// Props untuk komponen dialog
interface ProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit' | 'view';
  proposal?: ProposalWithRelations | null;
  bidangOptions: BidangPkm[];
  reviewerOptions: User[];
  onSave: (data: ProposalInput, mode: 'add' | 'edit') => Promise<void>;
  isLoading?: boolean;
}

export function ProposalDialog({
  open,
  onOpenChange,
  mode,
  proposal,
  bidangOptions,
  reviewerOptions,
  onSave,
  isLoading = false,
}: ProposalDialogProps) {
  const [activeTab, setActiveTab] = useState("proposal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Menggunakan isLoading dari props
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);
  
  // Inisialisasi form dengan default values atau data dari proposal yang ada
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      judul: "",
      nama_mahasiswa: "",
      nim: "",
      program_studi: "",
      jurusan: "",
      nomer_hp_mahasiswa: "",
      email_mahasiswa: "",
      nama_dosen: "",
      nidn: "",
      email_dosen: "",
      nomer_hp_dosen: "",
      url_file: "",
      jumlah_anggota: 1,
      id_bidang_pkm: 0,
      status_penilaian: "Belum Dinilai",
      dana_simbelmawa: 0,
      dana_perguruan_tinggi: 0,
      dana_pihak_lain: 0,
      reviewer1_id: "",
      reviewer2_id: "",
    },
  });
  
  // Update form values saat proposal berubah
  useEffect(() => {
    if (proposal && (mode === 'edit' || mode === 'view')) {
      // Extract reviewer IDs
      const reviewer1 = proposal.reviewers?.find(r => r.no === 1);
      const reviewer2 = proposal.reviewers?.find(r => r.no === 2);
      
      form.reset({
        judul: proposal.judul,
        nama_mahasiswa: proposal.mahasiswa?.nama || "",
        nim: proposal.mahasiswa?.nim || "",
        program_studi: proposal.mahasiswa?.program_studi || "",
        jurusan: proposal.mahasiswa?.jurusan || "",
        nomer_hp_mahasiswa: proposal.mahasiswa?.nomer_hp || "",
        email_mahasiswa: proposal.mahasiswa?.email || "",
        nama_dosen: proposal.dosen?.nama || "",
        nidn: proposal.dosen?.nidn || "",
        email_dosen: proposal.dosen?.email || "",
        nomer_hp_dosen: proposal.dosen?.nomer_hp || "",
        url_file: proposal.url_file || "",
        jumlah_anggota: proposal.jumlah_anggota,
        id_bidang_pkm: proposal.bidang_pkm?.id_bidang_pkm || 0,
        status_penilaian: proposal.status_penilaian || "Belum Dinilai",
        dana_simbelmawa: proposal.detail_pendanaan?.dana_simbelmawa || 0,
        dana_perguruan_tinggi: proposal.detail_pendanaan?.dana_perguruan_tinggi || 0,
        dana_pihak_lain: proposal.detail_pendanaan?.dana_pihak_lain || 0,
        reviewer1_id: reviewer1?.id_user || "none",
        reviewer2_id: reviewer2?.id_user || "none",
      });
      
      setFileUrl(proposal.url_file || "");
    } else {
      // Reset form jika dialog dibuka dalam mode 'add'
      form.reset({
        judul: "",
        nama_mahasiswa: "",
        nim: "",
        program_studi: "",
        jurusan: "",
        nomer_hp_mahasiswa: "",
        email_mahasiswa: "",
        nama_dosen: "",
        nidn: "",
        email_dosen: "",
        nomer_hp_dosen: "",
        url_file: "",
        jumlah_anggota: 1,
        id_bidang_pkm: 0,
        status_penilaian: "Belum Dinilai",
        dana_simbelmawa: 0,
        dana_perguruan_tinggi: 0,
        dana_pihak_lain: 0,
        reviewer1_id: "none",
        reviewer2_id: "none",
      });
      
      setFileUrl("");
    }
  }, [proposal, mode, form]);
  
  // Handler untuk form submission
  const onSubmit = async (data: ProposalFormValues) => {
    // Jika dalam mode view, jangan proses submission
    if (mode === "view") {
      return;
    }
    
    // Aktifkan loading di awal submit
    setLoading(true);
    
    try {
      console.log("[DIALOG] Mengirim data:", data);
      console.log("[DIALOG] Mode update:", mode);
      
      // Pastikan nilai "none" untuk reviewer diubah menjadi string kosong
      const submissionData = {
        ...data,
        reviewer1_id: data.reviewer1_id === "none" ? "" : data.reviewer1_id,
        reviewer2_id: data.reviewer2_id === "none" ? "" : data.reviewer2_id
      };
      
      // Debug: perlihatkan reviewers yang sudah ada vs yang baru
      const existingReviewer1 = proposal?.reviewers?.find(r => r.no === 1)?.id_user;
      const existingReviewer2 = proposal?.reviewers?.find(r => r.no === 2)?.id_user;
      
      console.log("[DIALOG] Reviewers sebelumnya:", {
        reviewer1: existingReviewer1 || "none",
        reviewer2: existingReviewer2 || "none" 
      });
      
      console.log("[DIALOG] Reviewers baru yang akan dikirim:", {
        reviewer1_id: submissionData.reviewer1_id || "kosong",
        reviewer2_id: submissionData.reviewer2_id || "kosong"
      });
      
      console.log("[DIALOG] Memanggil onSave dengan data yang telah dimodifikasi...");
      
      // Panggil fungsi onSave dengan data yang telah diproses
      await onSave(submissionData, mode);
      console.log("[DIALOG] onSave berhasil dijalankan");
      
      // Reset form jika mode add
      if (mode === 'add') {
        form.reset();
        setFileUrl("");
        setSelectedFile(null);
      }
      
      // Tutup dialog setelah berhasil
      onOpenChange(false);
    } catch (err) {
      console.error("[DIALOG] Error submitting form:", err);
      alert(`Error saat menyimpan: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      // Pastikan loading dinonaktifkan di akhir proses submit
      setLoading(false);
    }
  };
  
  // Handler untuk file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Dalam aplikasi nyata, ini akan mengunggah file ke server 
      // dan mendapatkan URL. Disini kita hanya membuat URL dummy.
      const dummyUrl = `https://example.com/files/${file.name}`;
      form.setValue("url_file", dummyUrl);
      setFileUrl(dummyUrl);
    }
  };
  
  // Handler untuk button upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Computed dialog title dan description
  const dialogTitle = mode === 'add' ? 'Tambah Proposal' : mode === 'edit' ? 'Edit Proposal' : 'Detail Proposal';
  const dialogDescription = mode === 'add' 
    ? 'Tambahkan proposal baru' 
    : mode === 'edit' 
      ? 'Edit data proposal' 
      : 'Lihat detail proposal';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="proposal">
                  Proposal
                </TabsTrigger>
                <TabsTrigger value="mahasiswa">
                  Mahasiswa
                </TabsTrigger>
                <TabsTrigger value="dosen">
                  Dosen
                </TabsTrigger>
                <TabsTrigger value="pendanaan">
                  Pendanaan
                </TabsTrigger>
                <TabsTrigger value="reviewer">
                  Reviewer
                </TabsTrigger>
              </TabsList>
              
              {/* Tab Proposal */}
              <TabsContent value="proposal" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="judul"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Proposal</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Masukkan judul proposal" 
                            disabled={mode === 'view' || loading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="id_bidang_pkm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bidang PKM</FormLabel>
                          <Select
                            disabled={mode === 'view' || loading}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih bidang PKM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bidangOptions.map((option) => (
                                <SelectItem 
                                  key={option.id_bidang_pkm} 
                                  value={option.id_bidang_pkm.toString()}
                                >
                                  {option.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jumlah_anggota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Anggota</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              placeholder="Jumlah anggota" 
                              disabled={mode === 'view' || loading} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {mode !== 'add' && (
                    <FormField
                      control={form.control}
                      name="status_penilaian"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Penilaian</FormLabel>
                          <Select
                            disabled={mode === 'view' || loading}
                            onValueChange={field.onChange}
                            value={field.value || "Belum Dinilai"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status penilaian" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Belum Dinilai">Belum Dinilai</SelectItem>
                              <SelectItem value="Sudah Dinilai">Sudah Dinilai</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="url_file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Proposal</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="URL file proposal" 
                              disabled={mode === 'view' || loading} 
                              value={fileUrl}
                              onChange={(e) => {
                                setFileUrl(e.target.value);
                                field.onChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          {mode !== 'view' && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleUploadClick}
                              disabled={loading}
                            >
                              Upload
                            </Button>
                          )}
                          {fileUrl && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => window.open(fileUrl, '_blank')}
                            >
                              Lihat
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileInputChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Tab Mahasiswa */}
              <TabsContent value="mahasiswa" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nama_mahasiswa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Ketua</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nama Ketua" disabled={mode === 'view' || loading} />
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
                          <Input {...field} placeholder="NIM Ketua" disabled={mode === 'view' || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="program_studi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Studi</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Program Studi" disabled={mode === 'view' || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="jurusan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jurusan</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jurusan" disabled={mode === 'view' || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nomer_hp_mahasiswa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor HP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nomor HP" disabled={mode === 'view' || loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email_mahasiswa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Email" 
                            type="email" 
                            disabled={mode === 'view' || loading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Tab Dosen */}
              <TabsContent value="dosen" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nama_dosen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Dosen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nama Dosen" disabled={mode === 'view' || loading} />
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
                          <Input {...field} placeholder="NIDN" disabled={mode === 'view' || loading} />
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
                        <FormLabel>Nomor HP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nomor HP" disabled={mode === 'view' || loading} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Email" 
                            type="email" 
                            disabled={mode === 'view' || loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Tab Pendanaan */}
              <TabsContent value="pendanaan" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="dana_simbelmawa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Simbelmawa (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            placeholder="Dana Simbelmawa" 
                            disabled={mode === 'view' || loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dana_perguruan_tinggi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Perguruan Tinggi (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            placeholder="Dana Perguruan Tinggi" 
                            disabled={mode === 'view' || loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dana_pihak_lain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dana Pihak Lain (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            placeholder="Dana Pihak Lain" 
                            disabled={mode === 'view' || loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {!loading && mode === 'view' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Pendanaan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        Rp {(
                          (form.getValues("dana_simbelmawa") || 0) + 
                          (form.getValues("dana_perguruan_tinggi") || 0) + 
                          (form.getValues("dana_pihak_lain") || 0)
                        ).toLocaleString('id-ID')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Tab Reviewer */}
              <TabsContent value="reviewer" className="space-y-4">
                <FormField
                  control={form.control}
                  name="reviewer1_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reviewer 1</FormLabel>
                      <Select
                        disabled={mode === 'view' || loading}
                        onValueChange={(value) => {
                          console.log("Mengubah reviewer 1 menjadi:", value);
                          field.onChange(value);
                        }}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih reviewer 1" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- Tidak Ada --</SelectItem>
                          {reviewerOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.username} ({option.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value && field.value !== "none" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviewer dipilih: {reviewerOptions.find(r => r.id === field.value)?.username}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reviewer2_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reviewer 2</FormLabel>
                      <Select
                        disabled={mode === 'view' || loading}
                        onValueChange={(value) => {
                          console.log("Mengubah reviewer 2 menjadi:", value);
                          field.onChange(value);
                        }}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih reviewer 2" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- Tidak Ada --</SelectItem>
                          {reviewerOptions
                            .filter(r => r.id !== form.getValues("reviewer1_id") || form.getValues("reviewer1_id") === "none")
                            .map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.username} ({option.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {field.value && field.value !== "none" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviewer dipilih: {reviewerOptions.find(r => r.id === field.value)?.username}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {mode === 'view' && proposal?.reviewers && proposal.reviewers.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Reviewer Ditugaskan:</h3>
                    <div className="space-y-2">
                      {proposal.reviewers
                        .sort((a, b) => a.no - b.no)
                        .map((reviewer) => {
                          console.log("Dialog rendering reviewer:", reviewer);
                          console.log("Dialog user data:", reviewer.user);
                          return (
                            <div key={reviewer.id_reviewer} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="mr-2">Reviewer {reviewer.no}</Badge>
                                <div className="font-semibold text-primary">
                                  {reviewer.user?.username || 'Tidak Ada Nama'}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <span className="w-16">Email:</span> 
                                  <span>{reviewer.user?.email || 'Tidak Ada Email'}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-16">Role:</span> 
                                  <span className="capitalize">{reviewer.user?.role || 'Tidak Ada Role'}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-16">ID User:</span> 
                                  <span>{reviewer.id_user || 'Tidak Ada ID'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                )}
                
                {mode === 'edit' && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      <strong>Catatan:</strong> Pilih "-- Tidak Ada --" untuk menghapus reviewer yang sudah ditugaskan.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <DialogFooter>
              {mode !== 'view' && (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'add' ? 'Tambah' : 'Simpan'}
                </Button>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {mode === 'view' ? 'Tutup' : 'Batal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
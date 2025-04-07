"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Users, getUserById, updateUser } from "@/services/user-service"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username harus memiliki minimal 2 karakter.",
  }),
  role: z.enum(["admin", "reviewer"], {
    required_error: "Silakan pilih peran user.",
  }),
})

export function EditUserDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = React.useState<Users | null>(null)
  const [open, setOpen] = React.useState(false)

  const editId = searchParams.get("editId")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      role: "admin",
    },
  })

  React.useEffect(() => {
    if (editId) {
      getUserById(editId)
        .then((data) => {
          setUser(data)
          form.reset({
            username: data.username,
            role: data.role as "admin" | "reviewer",
          })
          setOpen(true)
        })
        .catch((error) => {
          console.error("Error fetching user:", error)
        })
    } else {
      setOpen(false)
    }
  }, [editId, form])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("editId")
      router.push(`?${newSearchParams.toString()}`)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return

    try {
      await updateUser(user.id, {
        username: values.username,
        role: values.role,
      })
      toast.success("User berhasil diperbarui")
      handleOpenChange(false)
    } catch (error) {
      toast.error("Gagal memperbarui user")
      console.error(error)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Perbarui informasi user. Klik simpan ketika selesai.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Simpan</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
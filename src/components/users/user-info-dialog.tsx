"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, getUserById } from "@/services/user-service"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function UserInfoDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = React.useState<Users | null>(null)
  const [open, setOpen] = React.useState(false)

  const infoId = searchParams.get("infoId")

  React.useEffect(() => {
    if (infoId) {
      getUserById(infoId)
        .then((data) => {
          setUser(data)
          setOpen(true)
        })
        .catch((error) => {
          console.error("Error fetching user:", error)
        })
    } else {
      setOpen(false)
    }
  }, [infoId])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("infoId")
      router.push(`?${newSearchParams.toString()}`)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Informasi User</DialogTitle>
          <DialogDescription>
            Detail informasi user.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>{user.username}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="font-medium">ID:</span>
                <span>{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Peran:</span>
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tanggal Dibuat:</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
} 
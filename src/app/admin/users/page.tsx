import * as React from "react"
import { DataTable } from "@/components/users/data-table"
import { getUsers } from "@/services/user-service"
import { Users } from "@/services/user-service"
import { UserInfoDialog } from "@/components/users/user-info-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1
  const pageSize = 10
  const search = (params?.search as string) || ""
  const sortBy = (params?.sortBy as "username" | "email" | "role") || "username"
  const sortOrder = (params?.sortOrder as "asc" | "desc") || "asc"

  const { data, count } = await getUsers({
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  })

  return (
    <div className="w-screen mx-auto p-10 ">
      <DataTable
        data={data}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
      <UserInfoDialog />
      <EditUserDialog />
    </div>
  )
} 
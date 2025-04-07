"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Search } from "lucide-react"

import { Users } from "@/services/user-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps {
  data: Users[]
  totalCount: number
  page: number
  pageSize: number
  search: string
  sortBy: "username" | "email" | "role"
  sortOrder: "asc" | "desc"
}

export function DataTable({
  data,
  totalCount,
  page,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: DataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchValue, setSearchValue] = React.useState(search)

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handleSearch = () => {
    router.push(
      `?${createQueryString({
        ...Object.fromEntries(searchParams.entries()),
        search: searchValue,
        page: 1,
      })}`
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSort = (columnId: string) => {
    const newSortOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc"
    router.push(
      `?${createQueryString({
        ...Object.fromEntries(searchParams.entries()),
        sortBy: columnId,
        sortOrder: newSortOrder,
        page: 1,
      })}`
    )
  }

  const columns: ColumnDef<Users>[] = [
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort("username")}
            className="flex items-center gap-1"
          >
            Username
            <ArrowUpDown className="h-4 w-4" />
            {sortBy === "username" && (
              <span className="ml-1 text-xs">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <Button
          variant="ghost"
          className="w-full text-left"
          onClick={() => {
            router.push(
              `?${createQueryString({
                ...Object.fromEntries(searchParams.entries()),
                infoId: row.original.id,
              })}`
            )
          }}
        >
          <span className="sr-only">Lihat detail</span>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.username}</span>
            <span className="text-sm text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort("email")}
            className="flex items-center gap-1"
          >
            Email
            <ArrowUpDown className="h-4 w-4" />
            {sortBy === "email" && (
              <span className="ml-1 text-xs">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort("role")}
            className="flex items-center gap-1"
          >
            Role
            <ArrowUpDown className="h-4 w-4" />
            {sortBy === "role" && (
              <span className="ml-1 text-xs">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("role")}</span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <Button
          variant="outline"
          onClick={() => {
            router.push(
              `?${createQueryString({
                ...Object.fromEntries(searchParams.entries()),
                editId: row.original.id,
              })}`
            )
          }}
        >
          Edit
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Input
            placeholder="Cari user..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Cari</span>
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolom
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalCount} total data
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(
                `?${createQueryString({
                  ...Object.fromEntries(searchParams.entries()),
                  page: page - 1,
                })}`
              )
            }}
            disabled={page === 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(
                `?${createQueryString({
                  ...Object.fromEntries(searchParams.entries()),
                  page: page + 1,
                })}`
              )
            }}
            disabled={page * pageSize >= totalCount}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  )
} 
"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { formatLabelToTitleCase } from "@/lib/label-formatters"
import { Role } from "@/types/role"
import { Edit, Eye, MoreHorizontal, Shield, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useRef } from "react"

function permissionsCount(role: Role) {
  return role.permissions_count ?? role.permissions?.length ?? 0
}

export default function RolesPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "roles",
      uuid,
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-[#444444]">{formatLabelToTitleCase(row.original.name)}</div>
      ),
    },
    {
      accessorKey: "access_type",
      header: "Access Type",
      width: 150,
      cell: ({ row }) =>
        row.original.access_type ? formatLabelToTitleCase(row.original.access_type) : "N/A",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.original.description || ""}>
          {row.original.description || "No description"}
        </div>
      ),
    },
    {
      accessorKey: "permissions_count",
      header: "Permissions",
      width: 140,
      exportValue: (role) => permissionsCount(role),
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Shield className="h-4 w-4 text-[#ababab]" />
          <span className="text-[#444444]">{permissionsCount(row.original)}</span>
        </div>
      ),
    },
    {
      accessorKey: "users_count",
      header: "Users",
      width: 120,
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-[#ababab]" />
          <span className="text-[#444444]">{row.original.users_count || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      width: 200,
      cell: ({ row }) => row.original.created_at,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/general-settings/roles/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/general-settings/roles/${row.original.uuid}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteHandler(row.original.uuid)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <ListPageHeader
        title="Roles"
        description="Manage system roles and permissions"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/general-settings/roles/create")}
        addLabel="Add Role"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="name"
        searchPlaceholder="Search roles..."
        store="roles"
        exportFileName="Roles"
      />
    </div>
  )
}

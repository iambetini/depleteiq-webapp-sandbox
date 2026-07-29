'use client'

import ListPageHeader from '@/components/dashboard/ListPageHeader'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { ColumnDef } from '@/components/ui/data-table-types'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { handleDelete } from '@/lib/handleDelete'
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

export default function PromoSlabsPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: 'promoSlabs',
        uuid,
        onSuccess: refreshTable,
      })
    },
    [refreshTable]
  )

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'promo.type',
      header: 'Promo',
      cell: ({ row }: any) => row.original.promo?.type || '-',
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'bundle',
      header: 'Bundle',
      cell: ({ row }: any) => row.original.bundle || '-',
    },
    {
      accessorKey: 'reward',
      header: 'Reward',
      cell: ({ row }: any) => row.original.reward || '-',
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }: any) => {
        const value = row.original.value
        if (value === null || value === undefined || value === '') return '-'
        const num = Number(value)
        if (Number.isNaN(num)) return String(value)
        return num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const promoSlab = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/promo-slabs/${promoSlab.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/promo-slabs/${promoSlab.uuid}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => deleteHandler(promoSlab.uuid)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div>
      <ListPageHeader
        title="Promo Slabs"
        description="Manage promo slab configurations"
        showAddButton={true}
        onAdd={() => router.push('/dashboard/promos/promo-slabs/create')}
        addLabel="Add Promo Slab"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="title"
        searchPlaceholder="Search promo slabs..."
        store="promoSlabs"
        exportFileName="Promo Slabs"
        filters={[
          {
            type: 'selectWithFetch',
            label: 'Promo',
            param: 'promo_id',
            fetchUrl: '/promos',
            valueKey: 'uuid',
            labelKey: 'type',
            placeholder: 'All Promos',
          },
        ]}
      />
    </div>
  )
}
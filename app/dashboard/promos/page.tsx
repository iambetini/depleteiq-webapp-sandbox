'use client';

import ListPageHeader from '@/components/dashboard/ListPageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { handleDelete } from '@/lib/handleDelete';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export default function PromosPage() {
  const router = useRouter();
  const dataTableRef = useRef<{ refresh: () => void }>(null);

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh();
  }, []);

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: 'promos',
        uuid,
        onSuccess: refreshTable,
      });
    },
    [refreshTable]
  );

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: any) => row.original.title || '—',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }: any) => {
        const date = row.getValue('start_date');
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }: any) => {
        const date = row.getValue('end_date');
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const promo = row.original;
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
                  router.push(`/dashboard/promos/${promo.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/${promo.uuid}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => deleteHandler(promo.uuid)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <ListPageHeader
        title="Promos"
        description="Manage promotional campaigns"
        showAddButton={true}
        onAdd={() => router.push('/dashboard/promos/create')}
        addLabel="Add Promo"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="type"
        searchPlaceholder="Search promos..."
        store="promos"
        exportFileName="Promos"
      />
    </div>
  );
}


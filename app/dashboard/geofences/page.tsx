"use client";

import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleDelete } from "@/lib/handleDelete";
import type { Geofence } from "@/types/geofence";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";

const typeOptions = [
  { label: "All", value: "all" },
  { label: "Polygon", value: "polygon" },
  { label: "Circle", value: "circle" },
];

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Disabled", value: "disabled" },
];

export default function GeofencesPage() {
  const router = useRouter();
  const tableRef = useRef<{ refresh: () => void }>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "geofences",
        uuid,
        onSuccess: refreshTable,
      });
    },
    [refreshTable]
  );

  const columns = useMemo(
    () => getColumns(router, deleteHandler),
    [router, deleteHandler]
  );

  return (
    <div>
      <ListPageHeader
        title="Geofences"
        description="Manage device deployment geofences"
        showAddButton
        addLabel="Add Geofence"
        onAdd={() => router.push("/dashboard/geofences/create")}
      />

      <DataTable
        ref={tableRef}
        columns={columns as any as ColumnDef<unknown, unknown>[]}
        searchKey="name"
        searchPlaceholder="Search by name, description or type..."
        store="geofences"
        exportFileName="Geofences"
        filters={[
          { type: "disableDefaultDateRange" },
          {
            type: "select",
            label: "Type",
            param: "type",
            options: typeOptions,
          },
          {
            type: "select",
            label: "Status",
            param: "status",
            options: statusOptions,
          },
        ]}
      />
    </div>
  );
}

function getColumns(
  router: ReturnType<typeof useRouter>,
  handleDeleteRow: (uuid: string) => void
): ColumnDef<Geofence>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => row.original.type,
    },
    {
      accessorKey: "latitude",
      header: "Latitude",
      cell: ({ row }) => row.original.center_latitude ?? "-",
    },
    {
      accessorKey: "longitude",
      header: "Longitude",
      cell: ({ row }) => row.original?.center_longitude ?? "-",
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => row.original.created_at,
    },
    {
      accessorKey: "polygon",
      header: "Points",
      cell: ({ row }) => {
        const poly = row.original.polygon;
        if (!poly) return 0;
        let arr: unknown;
        if (typeof poly === "string") {
          try {
            arr = JSON.parse(poly);
          } catch {
            return 0;
          }
        } else {
          arr = poly;
        }
        if (!Array.isArray(arr)) return 0;
        // count only valid [lat,lng] pairs (coerce numeric strings)
        let count = 0;
        for (const item of arr as unknown[]) {
          if (!Array.isArray(item) || item.length !== 2) continue;
          const lat = Number((item as any)[0]);
          const lng = Number((item as any)[1]);
          if (Number.isFinite(lat) && Number.isFinite(lng)) count++;
        }
        return count;
      },
      showByDefault: true,
    },
    {
      accessorKey: "radius",
      header: "Radius",
      cell: ({ row }) => row.original.radius ?? "-",
      showByDefault: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status ?? "unknown";
        const colorMap: Record<string, string> = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800",
          disabled: "bg-red-100 text-red-800",
        };

        const label =
          typeof status === "string"
            ? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
            : String(status);

        return (
          <Badge className={colorMap[status] || "bg-gray-100 text-gray-800"}>
            {label}
          </Badge>
        );
      },
      showByDefault: true,
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
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/geofences/${row.original.uuid}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/geofences/${row.original.uuid}/edit`)
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteRow(row.original.uuid)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

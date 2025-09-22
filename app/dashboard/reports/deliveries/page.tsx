"use client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@/components/ui/data-table-types";
import { Delivery } from "@/types/delivery";
import { StatusBadge } from "@/components/ui/status-badge";

const columns: ColumnDef<unknown, unknown>[] = [
    {
        accessorKey: "order.order_ref",
        header: "Order Ref",
        width: 150,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.order?.order_ref || "-"}</span>;
        },
    },
    {
        accessorKey: "order.distributor.business_name",
        header: "Distributor",
        width: 200,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.order?.distributor?.business_name || "-"}</span>;
        },
    },
    {
        accessorKey: "vehicle.vehicle_code",
        header: "Vehicle Code",
        width: 150,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.vehicle?.vehicle_code || "-"}</span>;
        },
    },
    {
        id: "location",
        header: "Location",
        width: 300,
        columns: [
            {
                accessorKey: "from.full_name",
                header: "From",
                cell: ({ row }) => {
                    const delivery = row.original as Delivery;
                    return <div className="text-sm bg-blue-50 p-2 text-center">{delivery.from?.full_name || "-"}</div>;
                },
            },
            {
                accessorKey: "to.full_name",
                header: "To",
                cell: ({ row }) => {
                    const delivery = row.original as Delivery;
                    return <div className="text-sm bg-blue-50 p-2 text-center">{delivery.to?.full_name || "-"}</div>;
                },
            },
        ],
    },
    {
        accessorKey: "distance",
        header: "Distance (km)",
        width: 120,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.distance || "-"}</span>;
        },
    },
    {
        accessorKey: "total_order_volume",
        header: "Volume (m³)",
        width: 120,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.total_order_volume || "-"}</span>;
        },
    },
    {
        accessorKey: "total_order_weight",
        header: "Weight (kg)",
        width: 120,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.total_order_weight || "-"}</span>;
        },
    },
    {
        accessorKey: "total_order_density",
        header: "Density (kg/m³)",
        width: 140,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.total_order_density || "-"}</span>;
        },
    },
    {
        accessorKey: "cost_ratio",
        header: "Cost Ratio",
        width: 120,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            const costRatio = delivery.cost_ratio;
            if (!costRatio) return "-";

            const isHighCost = costRatio > 0.8;
            return (
                <span className={isHighCost ? "bg-red-100 text-red-800 px-2 py-1 rounded" : ""}>
                    {costRatio}
                </span>
            );
        },
    },
    {
        accessorKey: "delivery_burn_rate",
        header: "Burn Rate (NGN)",
        width: 150,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            const burnRate = delivery.delivery_burn_rate;
            if (!burnRate) return "-";

            // Highlight high burn rates (over 1000 NGN)
            const isHighBurnRate = burnRate > 1000;
            return (
                <span className={isHighBurnRate ? "bg-orange-100 text-orange-800 px-2 py-1 rounded" : ""}>
                    ₦{burnRate.toLocaleString()}
                </span>
            );
        },
    },
    {
        accessorKey: "vehicle_coverage",
        header: "Coverage (km)",
        width: 150,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.vehicle_coverage || "-"}</span>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        width: 150,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <StatusBadge status={delivery.status} />;
        },
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        width: 180,
        showByDefault: false,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.created_at ? new Date(delivery.created_at).toLocaleString() : "-"}</span>;
        },
    },
];

export default function DeliveryReportsPage() {
    return (
        <div>
            <DataTable
                columns={columns}
                store="deliveries"
                searchKey="order.order_ref"
                searchPlaceholder="Search by order reference"
                filters={[
                    {
                        type: "select",
                        label: "Status",
                        param: "status",
                        options: [
                            { label: "Awaiting", value: "awaiting" },
                            { label: "Pending Approval", value: "pending_approval" },
                            { label: "Update Requested", value: "update_requested" },
                            { label: "Approved", value: "approved" },
                            { label: "Delivered", value: "delivered" },
                            { label: "Fulfilled", value: "fulfilled" },
                        ],
                    },
                    {
                        type: "selectWithFetch",
                        label: "Distributor",
                        param: "distributor",
                        fetchUrl: "/distributors",
                        valueKey: "user.uuid",
                        labelKey: "business_name",
                        searchParam: "search",
                        placeholder: "Select distributor...",
                        labelFormatter: (item: any) => `${item.business_name}`,
                    },
                    {
                        type: "selectWithFetch",
                        label: "Vehicle",
                        param: "vehicle",
                        fetchUrl: "/vehicles",
                        valueKey: "uuid",
                        labelKey: "vehicle_code",
                        searchParam: "search",
                        placeholder: "Select vehicle...",
                        labelFormatter: (item: any) => `${item.vehicle_code}`,
                    },
                ]}
                exportFileName="DeliveryReport"
            />
        </div>
    );
}

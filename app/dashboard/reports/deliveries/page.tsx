"use client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@/components/ui/data-table-types";
import { Delivery } from "@/types/delivery";
import { StatusBadge } from "@/components/ui/status-badge";

const columns: ColumnDef<unknown, unknown>[] = [
    {
        accessorKey: "order.ref",
        header: "Order Ref",
        width: 100,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.order?.ref || "-"}</span>;
        },
    },
    {
        accessorKey: "order.distributor_user.distributor_details.business_name",
        header: "Distributor",
        width: 190,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.order?.distributor_user?.distributor_details?.business_name || "-"}</span>;
        },
    },
    {
        accessorKey: "vehicle.vehicle_number",
        header: "Vehicle Code",
        width: 125,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.vehicle?.vehicle_number || "-"}</span>;
        },
    },
    {
        id: "location",
        header: "Location",
        width: 300,
        columns: [
            {
                accessorKey: "from.full_location",
                header: "From",
                cell: ({ row }) => {
                    const delivery = row.original as Delivery;
                    return <div className="text-sm bg-blue-50 p-2 text-center">{delivery.from?.full_location || "-"}</div>;
                },
            },
            {
                accessorKey: "to.full_location",
                header: "To",
                cell: ({ row }) => {
                    const delivery = row.original as Delivery;
                    return <div className="text-sm bg-blue-50 p-2 text-center">{delivery.to?.full_location || "-"}</div>;
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
            const delivery = row.original as any;
            const costRatio = delivery.cost_ratio;
            if (!costRatio) return "-";

            const numericCostRatio = typeof costRatio === 'string' ? parseFloat(costRatio) : costRatio;
            const isHighCost = numericCostRatio > 0.8;
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
            const delivery = row.original as any;
            const burnRate = delivery.delivery_burn_rate;
            if (!burnRate) return "-";

            // Highlight high burn rates (over 1000 NGN)
            const numericBurnRate = typeof burnRate === 'string' ? parseFloat(burnRate) : burnRate;
            const isHighBurnRate = numericBurnRate > 1000;
            return (
                <span className={isHighBurnRate ? "bg-orange-100 text-orange-800 px-2 py-1 rounded" : ""}>
                    ₦{numericBurnRate.toLocaleString()}
                </span>
            );
        },
    },
    {
        accessorKey: "vehicle_volume_coverage",
        header: "Volume Coverage",
        width: 150,
        cell: ({ row }) => {
            const delivery = row.original as any;
            return <span>{delivery.vehicle_volume_coverage || "-"}</span>;
        },
    },
    {
        accessorKey: "vehicle_weight_coverage",
        header: "Weight Coverage",
        width: 150,
        cell: ({ row }) => {
            const delivery = row.original as any;
            return <span>{delivery.vehicle_weight_coverage || "-"}</span>;
        },
    },
    {
        accessorKey: "created_approved_lead_time",
        header: "CA Lead Time",
        width: 150,
        showByDefault: true,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.created_approved_lead_time || "-"}</span>;
        },
    },
    {
        accessorKey: "approved_delivered_lead_time",
        header: "AD Lead Time",
        width: 150,
        showByDefault: true,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.approved_delivered_lead_time || "-"}</span>;
        },
    },
    {
        accessorKey: "overall_lead_time",
        header: "Overall Lead Time",
        width: 160,
        showByDefault: true,
        cell: ({ row }) => {
            const delivery = row.original as Delivery;
            return <span>{delivery.overall_lead_time || "-"}</span>;
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
    }
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
                        valueKey: "uuid",
                        labelKey: "distributor_details.business_name",
                        searchParam: "search",
                        placeholder: "Select distributor...",
                        labelFormatter: (item: any) => `${item.distributor_details?.business_name || item.business_name}`,
                    },
                    {
                        type: "selectWithFetch",
                        label: "Vehicle",
                        param: "vehicle",
                        fetchUrl: "/vehicles",
                        valueKey: "uuid",
                        labelKey: "vehicle_number",
                        searchParam: "search",
                        placeholder: "Select vehicle...",
                        labelFormatter: (item: any) => `${item.vehicle_number}`,
                    },
                ]}
                exportFileName="DeliveryReport"
            />
        </div>
    );
}

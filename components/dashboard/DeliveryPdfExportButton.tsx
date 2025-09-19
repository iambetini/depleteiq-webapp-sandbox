"use client";

import GenericPdfExportButton from "@/components/dashboard/GenericPdfExportButton";
import { generateDeliveryReportTemplate } from "@/lib/pdf-templates/delivery-report";
import type { Delivery } from "@/types/delivery";

interface DeliveryPdfExportButtonProps {
  delivery: Delivery;
  className?: string;
}

export default function DeliveryPdfExportButton({ delivery, className }: DeliveryPdfExportButtonProps) {
  const exportOptions = {
    title: "Delivery Report",
    fileName: `delivery-report-${delivery.order?.ref || delivery.uuid}-${new Date().toISOString().split('T')[0]}.pdf`,
    categories: [
      {
        name: "Basic Information",
        fields: [
          { key: "order.ref", label: "Order Reference", value: delivery.order?.ref },
          { key: "uuid", label: "Delivery ID", value: delivery.uuid },
          { key: "created_at", label: "Created At", value: delivery.created_at },
          { key: "status", label: "Status", value: delivery.status },
        ]
      },
      {
        name: "Vehicle Information",
        fields: [
          { key: "vehicle.vehicle_number", label: "Vehicle Number", value: delivery.vehicle?.vehicle_number },
          { key: "vehicle.type", label: "Vehicle Type", value: delivery.vehicle?.type },
          { key: "vehicle_max_density", label: "Max Density", value: delivery.vehicle_max_density },
          { key: "vehicle_coverage", label: "Coverage", value: delivery.vehicle_coverage },
        ]
      },
      {
        name: "Location Information",
        fields: [
          { key: "from.full_location", label: "Pickup Location", value: delivery.from?.full_location },
          { key: "to.full_location", label: "Drop-off Location", value: delivery.to?.full_location },
          { key: "distance", label: "Distance", value: delivery.distance },
        ]
      },
      {
        name: "Delivery Metrics",
        fields: [
          { key: "total_order_volume", label: "Order Volume", value: delivery.total_order_volume },
          { key: "total_order_weight", label: "Order Weight", value: delivery.total_order_weight },
          { key: "total_order_density", label: "Order Density", value: delivery.total_order_density },
          { key: "cost_ratio", label: "Cost Ratio", value: delivery.cost_ratio },
          { key: "delivery_burn_rate", label: "Burn Rate (₦)", value: delivery.delivery_burn_rate },
        ]
      },
      {
        name: "Comments",
        fields: [
          { key: "comment", label: "Additional Notes", value: delivery.comment },
        ]
      }
    ],
    includeLogo: true,
    includeTimestamp: true,
    includeFooter: true,
    customTemplate: generateDeliveryReportTemplate
  };

  return (
    <GenericPdfExportButton
      data={delivery}
      options={exportOptions}
      className={className}
      buttonText="Export Delivery Details"
    />
  );
}

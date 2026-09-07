import { FilterConfig } from "@/components/ui/data-table";

export const INVENTORY_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Order", value: "order" },
  { label: "Supply", value: "supply" },
  { label: "Adjustment", value: "adjustment" },
  { label: "Reversal", value: "reversal" },
];

export const VSS_INVENTORY_FILTERS: FilterConfig[] = [
  {
    type: "selectWithFetch",
    label: "VSS",
    param: "vss_user_id",
    fetchUrl: "/users",
    valueKey: "uuid",
    labelKey: "full_name",
    searchParam: "search",
    placeholder: "Select VSS...",
    labelFormatter: (item: any) => item.full_name,
  },
  {
    type: "selectWithFetch",
    label: "Brand Package",
    param: "brand_package_id",
    fetchUrl: "/brands",
    valueKey: "uuid",
    labelKey: "name",
    searchParam: "search",
    placeholder: "Select brand...",
    labelFormatter: (item: any) => item.name,
  },
  {
    type: "text",
    label: "VSS Order Brand ID",
    param: "vss_order_brand_id",
  },
  {
    type: "text",
    label: "VSS Supply Brand ID",
    param: "vss_supply_brand_id",
  },
];

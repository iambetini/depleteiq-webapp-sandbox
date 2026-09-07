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
    type: "select",
    label: "Type",
    param: "type",
    options: INVENTORY_TYPE_OPTIONS,
  },
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
    label: "Brands",
    param: "brand",
    fetchUrl: "/brands",
    valueKey: "uuid",
    labelKey: "name",
    searchParam: "search",
    placeholder: "Select brand...",
    labelFormatter: (item: any) => item.name,
  },
  {
    type: "select",
    label: "Brand Package",
    param: "brand_package_id",
    options: [],
    dependsOn: "brand",
  },
];

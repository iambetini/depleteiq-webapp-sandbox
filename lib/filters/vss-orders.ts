import { FilterConfig } from "@/components/ui/data-table";

export const VSS_ORDER_FILTERS: FilterConfig[] = [
  {
    type: "selectWithFetch",
    label: "Distributor",
    param: "distributor_user_id",
    fetchUrl: "/distributors",
    valueKey: "user.uuid",
    labelKey: "business_name",
    searchParam: "search",
    placeholder: "Select distributor...",
    labelFormatter: (item: any) => item.business_name,
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
];

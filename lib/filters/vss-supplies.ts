import { FilterConfig } from "@/components/ui/data-table";

export const VSS_SUPPLY_FILTERS: FilterConfig[] = [
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
    label: "Business",
    param: "business_id",
    fetchUrl: "/businesses",
    valueKey: "uuid",
    labelKey: "name",
    searchParam: "search",
    placeholder: "Select business...",
    labelFormatter: (item: any) => item.name,
  },
];

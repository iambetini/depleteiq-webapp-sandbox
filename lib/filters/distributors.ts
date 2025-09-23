import { FilterConfig } from "@/components/ui/data-table";

export const DISTRIBUTOR_STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const DISTRIBUTOR_ROLE_OPTIONS = [
  { label: "All", value: "" },
  { label: "IME", value: "ime" },
  { label: "VSS", value: "vss" },
];

export const DISTRIBUTOR_FILTERS: FilterConfig[] = [
  {
    type: "select",
    label: "IME/VSS",
    param: "roles",
    options: DISTRIBUTOR_ROLE_OPTIONS,
  },
  {
    type: "select",
    label: "Status",
    param: "status",
    options: DISTRIBUTOR_STATUS_OPTIONS,
  },
];

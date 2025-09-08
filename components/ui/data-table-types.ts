import { ColumnDef as TanstackColumnDef } from "@tanstack/react-table";

export type ColumnDef<TData, TValue = unknown> = TanstackColumnDef<
  TData,
  TValue
> & {
  width?: number | string;
  exportValue?: (item: TData) => string | number;
  className?: string;
  style?: React.CSSProperties;
  showByDefault?: boolean;
};

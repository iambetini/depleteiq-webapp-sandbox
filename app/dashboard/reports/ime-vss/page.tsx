"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable, FilterConfig } from "@/components/ui/data-table";
import { ColumnDef } from "@/components/ui/data-table-types";
import { IMEVSSPerformance } from "@/types/ime-vss-performance";
import { Row } from "@tanstack/react-table";
import { useRef } from "react";
import * as XLSX from "xlsx-js-style";

type IMEVSSRow = Row<IMEVSSPerformance>;

const generateDayColumns = (maxDays: number = 21) => {
  return Array.from({ length: maxDays }, (_, i) => {
    const day = i + 1;
    const dayKey = `day_${day}`;
    return {
      header: `Day ${day}`,
      columns: [
        {
          id: `${dayKey}_daily`,
          header: "Daily",
          width: 80,
          className: "border-l",
          cell: ({ row }: { row: IMEVSSRow }) => {
            const dayData = row.original.performance_by_day[dayKey];
            return (
              <div className="flex items-center justify-center" title={dayData?.date || ''}>
                <span className="text-[#22c55e] font-semibold">{(dayData?.daily_performance ?? 0)}%</span>
              </div>
            );
          },
          exportValue: (row: IMEVSSPerformance) => {
            const dayData = row.performance_by_day[dayKey];
            return `${dayData?.daily_performance ?? 0}%`;
          },
        },
        {
          id: `${dayKey}_cum`,
          header: "Cum.",
          width: 80,
          className: "border-r",
          cell: ({ row }: { row: IMEVSSRow }) => {
            const dayData = row.original.performance_by_day[dayKey];
            return (
              <div className="flex items-center justify-center" title={dayData?.date || ''}>
                <span className="text-[#ea580c] font-semibold">{(dayData?.cummulative_performance ?? 0)}%</span>
              </div>
            );
          },
          exportValue: (row: IMEVSSPerformance) => {
            const dayData = row.performance_by_day[dayKey];
            return `${dayData?.cummulative_performance ?? 0}%`;
          },
        },
      ],
    };
  });
};

// Define columns with proper typing
const columns = [
  {
    accessorKey: "user.full_name",
    header: "IME/VSS",
    width: 200,
    cell: ({ row }: { row: IMEVSSRow }) => (
      <div>
        <div className="font-medium">
          {row.original.user.first_name} {row.original.user.last_name}
        </div>
        <div className="text-sm text-muted-foreground">{row.original.user.email}</div>
      </div>
    ),
    exportValue: (row: IMEVSSPerformance) => `${row.user.first_name} ${row.user.last_name}\n${row.user.email}`,
  },
  {
    accessorKey: "user.status",
    header: "Status",
    cell: ({ row }: { row: IMEVSSRow }) => (
      <Badge
        variant={row.original.user.status === "active" ? "default" : "destructive"}
        className={`status ${row.original.user.status === "active" ? "active" : "inactive"}`}
      >
        {row.original.user.status}
      </Badge>
    ),
    exportValue: (row: IMEVSSPerformance) => row.user.status,
  },
  ...generateDayColumns(),
];

// Custom export function for IME-VSS Performance matching the exact table format
const exportIMEVSSPerformance = (
  data: IMEVSSPerformance[],
  maxDays: number,
  exportFileName?: string,
  scope: "current_page" | "all" = "current_page"
) => {
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Add worksheet header/title row
  const worksheetTitle = "IME-VSS Performance Report";
  XLSX.utils.sheet_add_aoa(ws, [[worksheetTitle]], { origin: "A1" });

  // Create header rows exactly as shown in the image
  const headerRow1 = ["IME/VSS", "Status"];
  const headerRow2 = ["", ""];
  
  // Add day headers
  for (let i = 1; i <= maxDays; i++) {
    headerRow1.push(`Day ${i}`, "");
    headerRow2.push("Daily", "Cum.");
  }
  
  // Add headers to worksheet (start at A2 and A3)
  XLSX.utils.sheet_add_aoa(ws, [headerRow1], { origin: "A2" });
  XLSX.utils.sheet_add_aoa(ws, [headerRow2], { origin: "A3" });
  
  // Add data rows (start at A4)
  const dataRows = data.map((item) => {
    const row = [
      `${item.user.first_name} ${item.user.last_name}\n${item.user.email}`,
      item.user.status
    ];
    
    // Add performance data for each day
    for (let i = 1; i <= maxDays; i++) {
      const dayKey = `day_${i}`;
      const dayData = item.performance_by_day[dayKey];
      row.push(
        `${dayData?.daily_performance ?? 0}%`,
        `${dayData?.cummulative_performance ?? 0}%`
      );
    }
    
    return row;
  });
  
  XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });
  
  // Merge cells for worksheet title and Day headers
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 + maxDays * 2 } } // Title row merge
  ];
  for (let i = 1; i <= maxDays; i++) {
    const colIndex = 2 + (i - 1) * 2; // Starting from column C (index 2)
    merges.push({
      s: { r: 1, c: colIndex },
      e: { r: 1, c: colIndex + 1 }
    });
  }
  
  (ws as any)["!merges"] = merges;
  
  // Style worksheet title
  if ((ws as any)["A1"]) {
    ((ws as any)["A1"] as any).s = {
      alignment: { horizontal: "center", vertical: "center" },
      font: { sz: 18, bold: true },
    } as any;
  }
  (ws as any)["!rows"] = [{ hpt: 32 }, { hpt: 22 }, { hpt: 18 }];

  // Create workbook and save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "IME-VSS Performance");
  
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}`;
  const baseName = (exportFileName || "IME-VSS-Performance").replace(/\.xlsx$/, "");
  XLSX.writeFile(wb, `ORBIT_${baseName}_Report_${datetime}_${scope}.xlsx`);
};

export default function ReportsPage() {
  const columnsRef = useRef<any>(columns);

  const getDynamicColumns = (data: IMEVSSPerformance[] | undefined) => {
    if (data && data.length > 0 && data[0].workday_count) {
      const maxDays = data[0].workday_count;
      return [
        columns[0],
        columns[1],
        ...generateDayColumns(maxDays)
      ] as ColumnDef<IMEVSSPerformance>[];
    }
    return columns as ColumnDef<IMEVSSPerformance>[];
  };

  // Define filters
  const filters: FilterConfig[] = [
    { type: "disableDefaultDateRange" },
    { type: "month-year", label: "Month/Year", param: "month" }
  ];

  return (
    <div>
      <div className="flex items-center text-xs gap-1 m-4">
        <span className="font-medium">Keys:</span>
        <span>
          Daily performance
          <span className="text-green-600 font-semibold">: Green</span>, Cumulative performance
          <span className="text-orange-500 font-semibold">: Orange</span>
        </span>
      </div>
      <DataTable
        columns={columnsRef.current}
        store="reports"
        searchKey="user"
        searchPlaceholder="Search by ime/vss"
        exportFileName={`IME-VSS-Performance`}
        filters={filters}
        per_page={20}
        extraPath="ime_vss_performance"
        customExportFn={(data: unknown[], table, exportFileName, scope) => {
          let maxDays = 21;
          if (data && data.length > 0 && (data[0] as IMEVSSPerformance).performance_by_day) {
            maxDays = Object.keys((data[0] as IMEVSSPerformance).performance_by_day).length;
          }
          exportIMEVSSPerformance(data as IMEVSSPerformance[], maxDays, exportFileName, scope);
        }}
      />
    </div>
  );
}

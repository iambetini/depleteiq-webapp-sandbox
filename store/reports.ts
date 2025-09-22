import { createEntity } from "./entityFactory";

export const reports = createEntity<any>({
  reducerPath: "reports",
  entityEndpoint: "reports",
});

export const {
  useGetSingleQuery: useGetReportQuery,
  useGetAllQuery: useGetReportsQuery,
} = reports;

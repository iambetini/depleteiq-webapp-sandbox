import { brands } from "@/store/brands";
import { distributors } from "@/store/distributors";
import { imeVss } from "@/store/ime-vss";
import { orders } from "@/store/orders";
import { configureStore } from "@reduxjs/toolkit";
import { auditLogs } from "./audit-logs";
import { branches } from "./branches";
import { dashboardApi } from "./dashboard-api";
import dashboardFiltersReducer from "./dashboard-filters";
import { deliveries } from "./deliveries";
import { distributorOrders } from "./distributor-orders";
import { distributorTargets } from "./distributor-targets";
import { locations } from "./locations";
import { markets } from "./markets";
import { reports } from "./reports";
import { roles } from "./roles";
import { settings } from "./settings";
import { targets } from "./targets";
import { users } from "./users";
import { vehicles } from "./vehicles";
import { warehouses } from "./warehouses";
import { webUsers } from "./web-users";
import { AnyAction } from "@reduxjs/toolkit";

const autoResetMiddleware =
  (storeAPI: any) => (next: any) => (action: AnyAction) => {
    // Check for fulfilled mutation actions
    if (action.type && action.type.endsWith("/fulfilled")) {
      // Pattern: brandsApi/executeMutation/fulfilled
      const match = action.type.match(/^(\w+)\/executeMutation\/fulfilled$/);
      if (match) {
        const [, reducerPath] = match;

        // Get the actual endpoint name from meta.arg.endpointName
        const endpointName = action.meta?.arg?.endpointName;

        if (endpointName) {
          // Check if this is a mutation that should trigger a reset
          const isMutation =
            endpointName.startsWith("create") ||
            endpointName.startsWith("update") ||
            endpointName.startsWith("delete");

          if (isMutation) {
            // Find the matching API and reset its state
            const apiEntry = Object.values(storeApis).find(
              (api: any) => api.reducerPath === reducerPath,
            );

            if (apiEntry && apiEntry.util?.resetApiState) {
              setTimeout(() => {
                storeAPI.dispatch(apiEntry.util.resetApiState());
              }, 500);
            }
          }
        }
      }
    }

    return next(action);
  };

export const store = configureStore({
  reducer: {
    [auditLogs.reducerPath]: auditLogs.reducer,
    [brands.reducerPath]: brands.reducer,
    [branches.reducerPath]: branches.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    dashboardFilters: dashboardFiltersReducer,
    [deliveries.reducerPath]: deliveries.reducer,
    [distributorOrders.reducerPath]: distributorOrders.reducer,
    [distributorTargets.reducerPath]: distributorTargets.reducer,
    [distributors.reducerPath]: distributors.reducer,
    [imeVss.reducerPath]: imeVss.reducer,
    [locations.reducerPath]: locations.reducer,
    [markets.reducerPath]: markets.reducer,
    [orders.reducerPath]: orders.reducer,
    [reports.reducerPath]: reports.reducer,
    [roles.reducerPath]: roles.reducer,
    [settings.reducerPath]: settings.reducer,
    [targets.reducerPath]: targets.reducer,
    [users.reducerPath]: users.reducer,
    [vehicles.reducerPath]: vehicles.reducer,
    [warehouses.reducerPath]: warehouses.reducer,
    [webUsers.reducerPath]: webUsers.reducer,
  } as any,
  middleware: (getDefaultMiddleware) =>
    (getDefaultMiddleware() as any).concat([
      autoResetMiddleware,
      auditLogs.middleware,
      brands.middleware,
      branches.middleware,
      dashboardApi.middleware,
      deliveries.middleware,
      distributorOrders.middleware,
      distributorTargets.middleware,
      distributors.middleware,
      imeVss.middleware,
      locations.middleware,
      markets.middleware,
      orders.middleware,
      reports.middleware,
      roles.middleware,
      settings.middleware,
      targets.middleware,
      users.middleware,
      vehicles.middleware,
      warehouses.middleware,
      webUsers.middleware,
    ]) as any,
});

export const storeApis = {
  auditLogs,
  brands,
  branches,
  deliveries,
  distributorOrders,
  distributorTargets,
  distributors,
  imeVss,
  locations,
  markets,
  orders,
  reports,
  roles,
  settings,
  targets,
  users,
  vehicles,
  warehouses,
  webUsers,
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

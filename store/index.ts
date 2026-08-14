import { brands } from "@/store/brands";
import { businesses } from "@/store/businesses";
import { distributors } from "@/store/distributors";
import { imeVss } from "@/store/ime-vss";
import { orders } from "@/store/orders";
import { participants } from "@/store/participants";
import { promoters } from "@/store/promoters";
import { promoParticipations } from "@/store/promo-participations";
import { promos } from "@/store/promos";
import { promoSlabs } from "@/store/promo-slabs";
import { qrCodes } from "@/store/qr-codes";
import { stores } from "@/store/stores";
import { tpes } from "@/store/tpe";
import { vss } from "@/store/vss";
import { wholesalers } from "@/store/wholesalers";
import { AnyAction, configureStore } from "@reduxjs/toolkit";
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
import { notifications } from "./notifications";

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
            endpointName.startsWith("delete") ||
            endpointName.startsWith("assign") ||
            endpointName.startsWith("unassign");

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
    [businesses.reducerPath]: businesses.reducer,
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
    [participants.reducerPath]: participants.reducer,
    [promoters.reducerPath]: promoters.reducer,
    [promoParticipations.reducerPath]: promoParticipations.reducer,
    [promos.reducerPath]: promos.reducer,
    [promoSlabs.reducerPath]: promoSlabs.reducer,
    [qrCodes.reducerPath]: qrCodes.reducer,
    [reports.reducerPath]: reports.reducer,
    [roles.reducerPath]: roles.reducer,
    [notifications.reducerPath]: notifications.reducer,
    [settings.reducerPath]: settings.reducer,
    [stores.reducerPath]: stores.reducer,
    [targets.reducerPath]: targets.reducer,
    [tpes.reducerPath]: tpes.reducer,
    [users.reducerPath]: users.reducer,
    [vehicles.reducerPath]: vehicles.reducer,
    [vss.reducerPath]: vss.reducer,
    [warehouses.reducerPath]: warehouses.reducer,
    [webUsers.reducerPath]: webUsers.reducer,
    [wholesalers.reducerPath]: wholesalers.reducer,
  } as any,
  middleware: (getDefaultMiddleware) =>
    (getDefaultMiddleware() as any).concat([
      autoResetMiddleware,
      auditLogs.middleware,
      brands.middleware,
      branches.middleware,
      businesses.middleware,
      dashboardApi.middleware,
      deliveries.middleware,
      distributorOrders.middleware,
      distributorTargets.middleware,
      distributors.middleware,
      imeVss.middleware,
      locations.middleware,
      markets.middleware,
      orders.middleware,
      participants.middleware,
      promoters.middleware,
      promoParticipations.middleware,
      promos.middleware,
      promoSlabs.middleware,
      qrCodes.middleware,
      reports.middleware,
      roles.middleware,
      notifications.middleware,
      settings.middleware,
      stores.middleware,
      targets.middleware,
      tpes.middleware,
      users.middleware,
      vehicles.middleware,
      vss.middleware,
      warehouses.middleware,
      webUsers.middleware,
      wholesalers.middleware,
    ]) as any,
});

export const storeApis = {
  auditLogs,
  brands,
  branches,
  businesses,
  deliveries,
  distributorOrders,
  distributorTargets,
  distributors,
  imeVss,
  locations,
  markets,
  orders,
  participants,
  promoters,
  promoParticipations,
  promos,
  promoSlabs,
  qrCodes,
  reports,
  roles,
  notifications,
  settings,
  stores,
  targets,
  tpes,
  users,
  vehicles,
  vss,
  warehouses,
  webUsers,
  wholesalers,
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

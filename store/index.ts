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
import { assignments } from "./assignments";
import { auditLogs } from "./audit-logs";
import { branches } from "./branches";
import { coverageAreas } from "./coverage-areas";
import { dashboardApi } from "./dashboard-api";
import dashboardFiltersReducer from "./dashboard-filters";
import { deliveries } from "./deliveries";
import { distributorOrders } from "./distributor-orders";
import { distributorTargets } from "./distributor-targets";
import { locations } from "./locations";
import { lgas } from "./lgas";
import { regions } from "./regions";
import { states } from "./states";
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
    [assignments.reducerPath]: assignments.reducer,
    [auditLogs.reducerPath]: auditLogs.reducer,
    [brands.reducerPath]: brands.reducer,
    [branches.reducerPath]: branches.reducer,
    [businesses.reducerPath]: businesses.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    dashboardFilters: dashboardFiltersReducer,
    [coverageAreas.reducerPath]: coverageAreas.reducer,
    [deliveries.reducerPath]: deliveries.reducer,
    [distributorOrders.reducerPath]: distributorOrders.reducer,
    [distributorTargets.reducerPath]: distributorTargets.reducer,
    [distributors.reducerPath]: distributors.reducer,
    [imeVss.reducerPath]: imeVss.reducer,
    [locations.reducerPath]: locations.reducer,
    [lgas.reducerPath]: lgas.reducer,
    [markets.reducerPath]: markets.reducer,
    [orders.reducerPath]: orders.reducer,
    [participants.reducerPath]: participants.reducer,
    [promoters.reducerPath]: promoters.reducer,
    [promoParticipations.reducerPath]: promoParticipations.reducer,
    [promos.reducerPath]: promos.reducer,
    [promoSlabs.reducerPath]: promoSlabs.reducer,
    [qrCodes.reducerPath]: qrCodes.reducer,
    [reports.reducerPath]: reports.reducer,
    [regions.reducerPath]: regions.reducer,
    [roles.reducerPath]: roles.reducer,
    [notifications.reducerPath]: notifications.reducer,
    [settings.reducerPath]: settings.reducer,
    [states.reducerPath]: states.reducer,
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
      assignments.middleware,
      auditLogs.middleware,
      brands.middleware,
      branches.middleware,
      businesses.middleware,
      dashboardApi.middleware,
      coverageAreas.middleware,
      deliveries.middleware,
      distributorOrders.middleware,
      distributorTargets.middleware,
      distributors.middleware,
      imeVss.middleware,
      locations.middleware,
      lgas.middleware,
      markets.middleware,
      orders.middleware,
      participants.middleware,
      promoters.middleware,
      promoParticipations.middleware,
      promos.middleware,
      promoSlabs.middleware,
      qrCodes.middleware,
      reports.middleware,
      regions.middleware,
      roles.middleware,
      notifications.middleware,
      settings.middleware,
      states.middleware,
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
  assignments,
  auditLogs,
  brands,
  branches,
  businesses,
  coverageAreas,
  deliveries,
  distributorOrders,
  distributorTargets,
  distributors,
  imeVss,
  locations,
  lgas,
  markets,
  orders,
  participants,
  promoters,
  promoParticipations,
  promos,
  promoSlabs,
  qrCodes,
  reports,
  regions,
  roles,
  notifications,
  settings,
  states,
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

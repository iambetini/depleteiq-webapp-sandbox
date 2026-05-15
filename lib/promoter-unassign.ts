import { apiClient } from "@/lib/api-client";

export async function unassignStoresFromPromoter(promoterUuid: string, storeUuids: string[]) {
  return apiClient.delete(`/promoters/${promoterUuid}/stores`, {
    data: {
      store_uuids: storeUuids,
    },
  });
}

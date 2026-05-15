import { apiClient } from "@/lib/api-client";

export async function assignStoresToPromoter(promoterUuid: string, storeUuids: string[]) {
  return apiClient.post(`/promoters/${promoterUuid}/stores`, {
    store_uuids: storeUuids,
  });
}

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiClient } from "@/lib/api-client";
import type { Store } from "@/types/store";
import { normalizeStoreCategories } from "@/types/store";
import { useContext } from "../layout";

interface AssignStoreModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { toAssign: string[]; toUnassign: string[] }) => void;
  isSaving?: boolean;
}

const STORES_PER_PAGE = 100;

const checkboxClassName =
  "border-black data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=indeterminate]:bg-black data-[state=indeterminate]:text-white";

const extractStores = (resp: unknown): Store[] => {
  const data = (resp as { data?: { items?: Store[] } | Store[] })?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(resp)) return resp as Store[];
  return [];
};

const extractLastPage = (resp: unknown): number => {
  const pagination =
    (resp as { meta?: { pagination?: { last_page?: number } } })?.meta?.pagination ||
    (resp as { data?: { meta?: { pagination?: { last_page?: number } } } })?.data?.meta
      ?.pagination ||
    (resp as { data?: { pagination?: { last_page?: number } } })?.data?.pagination;
  return Number(pagination?.last_page) || 1;
};

async function fetchAllStores(
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<Store[]> {
  const allItems: Store[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const query = new URLSearchParams({
      ...params,
      page: String(page),
      per_page: String(STORES_PER_PAGE),
    });
    const resp = await apiClient.get(`/stores?${query}`, {
      signal,
      showToast: false,
    });
    allItems.push(...extractStores(resp));
    lastPage = extractLastPage(resp);
    page += 1;
  } while (page <= lastPage && !signal?.aborted);

  return allItems;
}

export default function AssignStoreModal({
  open,
  onClose,
  onSave,
  isSaving = false,
}: AssignStoreModalProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [assignedStoreUuids, setAssignedStoreUuids] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { promoter } = useContext();

  const promoterMarket = promoter?.market_assignment || promoter?.market;
  const marketId = promoterMarket?.uuid || promoter?.market_id || "";
  const marketName =
    promoterMarket?.full_name || promoterMarket?.name || "No market assigned";

  useEffect(() => {
    if (!open || !marketId || !promoter?.uuid) {
      if (!open) {
        setStores([]);
        setAssignedStoreUuids([]);
        setSelectedStores([]);
        setSearch("");
        setError(null);
      }
      return;
    }

    const abort = new AbortController();

    const loadStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const [available, assigned] = await Promise.all([
          fetchAllStores(
            { market_id: marketId, has_promoter: "false" },
            abort.signal
          ),
          fetchAllStores(
            { market_id: marketId, promoter_id: promoter.uuid },
            abort.signal
          ),
        ]);

        if (abort.signal.aborted) return;

        const assignedUuids = assigned.map((store) => store.uuid);
        const byUuid = new Map<string, Store>();
        [...assigned, ...available].forEach((store) => {
          byUuid.set(store.uuid, store);
        });

        setAssignedStoreUuids(assignedUuids);
        setStores(Array.from(byUuid.values()));
        setSelectedStores(assignedUuids);
      } catch (e: any) {
        if (
          abort.signal.aborted ||
          e?.name === "AbortError" ||
          e?.name === "CanceledError" ||
          e?.message === "canceled"
        ) {
          return;
        }
        console.error(e);
        setStores([]);
        setAssignedStoreUuids([]);
        setSelectedStores([]);
        setError("Failed to load stores. Please try again.");
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    };

    loadStores();
    return () => abort.abort();
  }, [open, marketId, promoter?.uuid]);

  const filteredStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter((store) => {
      const name = store.business?.name?.toLowerCase() || "";
      const address = store.business?.address?.toLowerCase() || "";
      const type = store.business?.type?.toLowerCase() || "";
      const categories = normalizeStoreCategories(store.category).join(" ").toLowerCase();
      return (
        name.includes(term) ||
        address.includes(term) ||
        type.includes(term) ||
        categories.includes(term)
      );
    });
  }, [stores, search]);

  const allFilteredSelected =
    filteredStores.length > 0 &&
    filteredStores.every((store) => selectedStores.includes(store.uuid));
  const someFilteredSelected = filteredStores.some((store) =>
    selectedStores.includes(store.uuid)
  );
  // Every checked store goes in the assign payload, including ones that were
  // initially assigned and left selected. Only unchecked assigned stores unassign.
  const toAssign = selectedStores;
  const toUnassign = assignedStoreUuids.filter((uuid) => !selectedStores.includes(uuid));
  const hasChanges =
    toUnassign.length > 0 ||
    selectedStores.length !== assignedStoreUuids.length ||
    selectedStores.some((uuid) => !assignedStoreUuids.includes(uuid));

  const handleToggleAll = () => {
    setSelectedStores((prev) => {
      const filteredIds = filteredStores.map((store) => store.uuid);
      const filteredIdSet = new Set(filteredIds);
      const everyFilteredSelected =
        filteredIds.length > 0 && filteredIds.every((id) => prev.includes(id));

      if (everyFilteredSelected) {
        return prev.filter((id) => !filteredIdSet.has(id));
      }

      // Absolute select — never toggle/XOR existing selections away
      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };

  const handleToggleStore = (storeUuid: string, checked: boolean) => {
    setSelectedStores((prev) => {
      if (checked) {
        return prev.includes(storeUuid) ? prev : [...prev, storeUuid];
      }
      return prev.filter((id) => id !== storeUuid);
    });
  };

  const formatCategories = (category: Store["category"]) => {
    const categories = normalizeStoreCategories(category);
    return categories.length > 0 ? categories.join(", ") : "";
  };

  return (
    <Modal open={open} onClose={onClose} size="xlg-center" title="Assign Stores to Promoter">
      <div className="p-4">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Market</label>
          <p className="text-sm text-[#444444]">{marketName}</p>
          {!marketId && (
            <p className="text-sm text-red-500 mt-1">
              This promoter has no assigned market.
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Stores</label>
          {!marketId ? (
            <div className="text-muted-foreground">
              Assign a market to this promoter before selecting stores.
            </div>
          ) : loading ? (
            <div className="text-sm text-muted-foreground">Loading all stores for this market...</div>
          ) : error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : stores.length === 0 ? (
            <div className="text-muted-foreground">No stores found for this market.</div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="space-y-2 px-3 py-2.5 border-b bg-muted/40">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stores by name, address, type, or category"
                  className="h-9"
                />
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      allFilteredSelected
                        ? true
                        : someFilteredSelected
                          ? "indeterminate"
                          : false
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleAll();
                    }}
                    onCheckedChange={() => {
                    }}
                    className={checkboxClassName}
                    aria-label="Select all stores"
                  />
                  <span className="text-sm font-medium">Select All</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedStores.length} selected
                    {search.trim()
                      ? ` · showing ${filteredStores.length} of ${stores.length}`
                      : ` of ${stores.length}`}
                  </span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y">
                {filteredStores.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground">
                    No stores match your search.
                  </div>
                ) : (
                  filteredStores.map((store) => {
                    const isAlreadyAssigned = assignedStoreUuids.includes(store.uuid);
                    const categories = formatCategories(store.category);
                    const checked = selectedStores.includes(store.uuid);

                    return (
                      <div
                        key={store.uuid}
                        className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30"
                        onClick={() => handleToggleStore(store.uuid, !checked)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleToggleStore(store.uuid, !checked);
                          }
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => handleToggleStore(store.uuid, value === true)}
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-0.5 ${checkboxClassName}`}
                          aria-label={store.business?.name || "Store"}
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#444444]">
                              {store.business?.name || "Unnamed"}
                            </span>
                            {isAlreadyAssigned && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                Assigned
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-x-1">
                            {store.business?.address && <span>{store.business.address}</span>}
                            {store.business?.type && (
                              <span className="capitalize">· {store.business.type}</span>
                            )}
                            {categories && <span>· {categories}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                toAssign,
                toUnassign,
              })
            }
            disabled={!hasChanges || isSaving || !marketId}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

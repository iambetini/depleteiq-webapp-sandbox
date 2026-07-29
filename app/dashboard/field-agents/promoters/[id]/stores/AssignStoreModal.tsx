import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectWithFetch } from "@/components/ui/select";
import { useGetStoresQuery } from "@/store/stores";
import type { Store } from "@/types/store";
import { useContext } from "../layout";

interface AssignStoreModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (storeUuids: string[]) => void;
}

export default function AssignStoreModal({ open, onClose, onAssign }: AssignStoreModalProps) {
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  useEffect(() => {
    if (!open) return;
    setSelectedStores([]);
  }, [open, selectedMarket]);

  // Fetch stores using redux store API
  const { data: storesResp, isLoading: loading } = useGetStoresQuery(
    selectedMarket ? { params: { market_id: selectedMarket, has_promoter: false } } : { params: { has_promoter: false } },
    { skip: !selectedMarket }
  );
  const { promoter } = useContext();
  const assignedStoreUuids = useMemo(
    () =>
      (promoter?.stores ?? [])
        .map((s: any) => s.store?.uuid || s.store_uuid || s.uuid)
        .filter((uuid: unknown): uuid is string => Boolean(uuid)),
    [promoter]
  );

  // getAll returns the full API envelope at runtime
  const stores = useMemo(() => {
    const items = (
      Array.isArray(storesResp)
        ? storesResp
        : ((storesResp as { data?: { items?: Store[] } } | undefined)?.data?.items ?? [])
    ) as Store[];
    return items.filter((store) => !assignedStoreUuids.includes(store.uuid));
  }, [storesResp, assignedStoreUuids]);

  return (
    <Modal open={open} onClose={onClose} size="xlg-center" title="Assign Stores to Promoter">
      <div className="p-4">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Filter by Market</label>
          <SelectWithFetch
            fetchUrl="/markets"
            value={selectedMarket}
            onChange={setSelectedMarket}
            valueKey="uuid"
            labelKey="name"
            placeholder="Select market"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Stores</label>
          {loading ? (
            <div>Loading stores...</div>
          ) : stores.length === 0 ? (
            <div className="text-muted-foreground">No stores found for this market.</div>
          ) : (
            <div className="max-h-64 overflow-y-auto border rounded p-2">
              {stores.map((store) => (
                <label key={store.uuid} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStores.includes(store.uuid)}
                    onChange={(e) => {
                      setSelectedStores((prev) =>
                        e.target.checked
                          ? [...prev, store.uuid]
                          : prev.filter((id) => id !== store.uuid)
                      );
                    }}
                  />
                  <span className="font-medium">{store.business?.name || "Unnamed"}</span>
                  <span className="text-xs text-muted-foreground">{store.business?.address}</span>
                  <span className="text-xs text-muted-foreground capitalize">{store.business?.type}</span>
                  <span className="text-xs text-muted-foreground">{store.category}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAssign(selectedStores)} disabled={selectedStores.length === 0}>Assign Selected</Button>
        </div>
      </div>
    </Modal>
  );
}

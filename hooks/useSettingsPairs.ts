import React from "react";
import { settings } from "@/store/settings";
import { toast } from "@/hooks/use-toast";
import { Setting } from "@/types/setting";

export function useSettingsPairs(parentKey: string) {
  const { data, refetch, isFetching } = settings.useGetAllQuery({
    params: { key: parentKey },
  });
  const settingsData = (data as any)?.data?.items as Setting[] | undefined;

  const [createSettings] = settings.useCreateMutation();
  const [deleteSettings] = settings.useDeleteMutation();

  const initialValues: Setting[] = React.useMemo(
    () =>
      settingsData?.map((s) => ({
        uuid: s.uuid,
        key: s.key,
        sub_key: s.sub_key,
        value: s.value,
        description: s.description || "",
        status: s.status || "active",
        created_at: s.created_at,
      })) || [],
    [settingsData],
  );

  const handleSave = React.useCallback(
    async (pairs: Array<{ sub_key: string; value: string }>) => {
      await createSettings({
        data: { settings: pairs.map((p) => ({ key: parentKey, ...p })) } as any,
      }).unwrap();
      toast({
        title: "Success",
        description: `${parentKey[0].toUpperCase()}${parentKey.slice(1)} settings updated successfully`,
      });
      refetch();
    },
    [createSettings, refetch, parentKey],
  );

  const handleDelete = React.useCallback(
    async (uuid: string) => {
      await deleteSettings({ id: uuid }).unwrap();
      toast({ title: "Success", description: "Setting deleted successfully" });
      refetch();
    },
    [deleteSettings, refetch],
  );

  return { initialValues, handleSave, handleDelete, isFetching };
}

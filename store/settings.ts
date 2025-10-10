import { Setting } from "./../types/setting";
import { createEntity } from "./entityFactory";

export const settings = createEntity<Setting>({
  reducerPath: "settingsApi",
  entityEndpoint: "settings",
  entityName: "Setting",
});
export const {
  useGetAllQuery: useGetSettingsQuery,
  useGetByIdQuery: useGetSettingQuery,
  useCreateMutation: useCreateSettingMutation,
  useUpdateMutation: useUpdateSettingMutation,
  useDeleteMutation: useDeleteSettingMutation,
} = settings;

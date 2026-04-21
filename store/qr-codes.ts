import type { QrCode } from "../types/qr-code"
import { createEntity } from "./entityFactory"

export const qrCodes = createEntity<QrCode>({
  reducerPath: "qrCodesApi",
  entityEndpoint: "qr-codes",
  entityName: "QrCode",
})

export const {
  useGetAllQuery: useGetQrCodesQuery,
  useGetByIdQuery: useGetQrCodeQuery,
  useCreateMutation: useCreateQrCodeMutation,
  useUpdateMutation: useUpdateQrCodeMutation,
  useDeleteMutation: useDeleteQrCodeMutation,
} = qrCodes

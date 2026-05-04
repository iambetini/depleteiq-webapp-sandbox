import type { QrCode } from "../types/qr-code"
import { createEntity } from "./entityFactory"

const qrCodesBase = createEntity<QrCode>({
  reducerPath: "qrCodesApi",
  entityEndpoint: "qr-codes",
  entityName: "QrCode",
  tagTypes: ["QrCode", "Store"],
})

// Inject custom endpoints for assignment
export const qrCodes = qrCodesBase.injectEndpoints({
  endpoints: (builder) => ({
    assignQrCode: builder.mutation<
      QrCode,
      { id: string; data: { store_uuid: string } }
    >({
      query: ({ id, data }) => ({
        url: `/qr-codes/${id}/assign`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["QrCode", "Store"],
    }),
    unassignQrCode: builder.mutation<QrCode, string>({
      query: (id: string) => ({
        url: `/qr-codes/${id}/unassign`,
        method: "DELETE",
      }),
      invalidatesTags: ["QrCode", "Store"],
    }),
    showByReference: builder.query<QrCode, string>({
      query: (reference: string) => ({
        url: `/qr-codes/reference/${reference}`,
        method: "GET_SINGLE",
      }),
      providesTags: ["QrCode"],
    }),
  }),
})

export const {
  useGetAllQuery: useGetQrCodesQuery,
  useGetByIdQuery: useGetQrCodeQuery,
  useCreateMutation: useCreateQrCodeMutation,
  useUpdateMutation: useUpdateQrCodeMutation,
  useDeleteMutation: useDeleteQrCodeMutation,
  useAssignQrCodeMutation,
  useUnassignQrCodeMutation,
  useShowByReferenceQuery,
} = qrCodes

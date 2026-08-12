"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { userFullNameEmailFormatter } from "@/lib/label-formatters"
import { catchError } from "@/lib/utils"
import { useUpdateBusinessMutation } from "@/store/businesses"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { SelectWithFetch } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { FieldArray } from "formik"
import * as Yup from "yup"
import { useContext } from "../layout"

export default function EditWholesalerPage() {
  const { wholesaler, isLoading, fetchEntity } = useContext()
  const router = useRouter()
  const [updateWholesaler, { isLoading: isUpdating }] = useUpdateBusinessMutation()
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_address: "",
    tpe_user_id: "",
    stores: [],
  })
  const formRef = useRef<any>(null)

  useEffect(() => {
    if (wholesaler) {
      const stores = (wholesaler.stores ?? []) as Array<{
        uuid?: string
        address?: string
        type?: string
        category?: string
        market_id?: string
        market?: { uuid?: string }
      }>
      setInitialValues({
        first_name: wholesaler.user?.first_name || "",
        last_name: wholesaler.user?.last_name || "",
        email: wholesaler.user?.email || "",
        phone: wholesaler.user?.phone || "",
        business_name: wholesaler.name || "",
        business_address: wholesaler.address || "",
        tpe_user_id: wholesaler.tpe_user?.uuid || "",
        stores: stores.map((store) => ({
          uuid: store.uuid,
          address: store.address || "",
          type: store.type || "",
          category: store.category || "",
          market_id: store.market?.uuid || store.market_id || "",
        })) as any,
      })
    }
  }, [wholesaler])

  const validationSchema = Yup.object({
    first_name: Yup.string(),
    last_name: Yup.string(),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string(),
    business_name: Yup.string(),
    business_address: Yup.string(),
    tpe_user_id: Yup.string().nullable(),
    stores: Yup.array().of(
      Yup.object().shape({
        uuid: Yup.string().nullable(),
        address: Yup.string().nullable(),
        type: Yup.string().nullable(),
        category: Yup.string().nullable(),
        market_id: Yup.string().nullable(),
      })
    ),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await updateWholesaler({ id: wholesaler!.uuid, data: values }).unwrap()
      toast({
        title: "Success",
        description: "Wholesaler updated successfully",
      })
      fetchEntity()
      router.push("/dashboard/businesses/wholesalers")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: "business_name",
      label: "Business Name",
      type: "text" as const,
      required: false,
      placeholder: "Enter business name",
      section: "Business Information",
    },
    {
      name: "business_address",
      label: "Address",
      type: "text" as const,
      required: false,
      placeholder: "Enter business address",
      section: "Business Information",
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text" as const,
      required: false,
      placeholder: "Enter first name",
      section: "User Information",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: false,
      placeholder: "Enter last name",
      section: "User Information",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: false,
      placeholder: "Enter email address",
      section: "User Information",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number (international format)",
      section: "User Information",
    },
    {
      name: "tpe_user_id",
      label: "TPE",
      type: "selectWithFetch" as const,
      required: false,
      store: "users",
      valueKey: "uuid",
      labelKey: "email",
      labelFormatter: userFullNameEmailFormatter,
      placeholder: "Select TPE user",
      initialSearch: wholesaler?.tpe_user?.email || "",
      params: { roles: "tpe" },
      section: "Assignment",
    },
    {
      name: "stores_array",
      label: "Attached Stores",
      type: "custom" as const,
      section: "Stores",
      colSpan: 2,
      renderCustom: ({ values, handleChange, setFieldValue }: any) => (
        <FieldArray name="stores">
          {({ push, remove }) => (
            <div className="space-y-4">
              {values.stores && values.stores.length > 0 ? (
                values.stores.map((store: any, index: number) => (
                  <div key={index} className="p-4 border rounded-md relative bg-gray-50">
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-8 w-8 p-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="text-sm font-semibold mb-3">Store {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Store Address</Label>
                        <Input
                          name={`stores.${index}.address`}
                          value={store.address || ""}
                          onChange={handleChange}
                          placeholder="Enter store address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Store Type</Label>
                        <Input
                          name={`stores.${index}.type`}
                          value={store.type || ""}
                          onChange={handleChange}
                          placeholder="e.g., Retail, Kiosk"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          name={`stores.${index}.category`}
                          value={store.category || ""}
                          onChange={handleChange}
                          placeholder="e.g., Electronics, Groceries"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Market</Label>
                        <SelectWithFetch
                          fetchUrl="/markets"
                          value={store.market_id || ""}
                          onChange={(uuid) => setFieldValue(`stores.${index}.market_id`, uuid)}
                          valueKey="uuid"
                          labelKey="name"
                          placeholder="Select Market"
                          initialSearch={store.market_id ? undefined : ""} // Note: Initial Search should be bound appropriately if needed
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No stores attached.</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => push({ address: "", type: "", category: "", market_id: "", uuid: "" })}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </Button>
            </div>
          )}
        </FieldArray>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!wholesaler) {
    return null
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Wholesaler"
        description="Update wholesaler details"
      />
      <UserForm
        title="Edit Wholesaler"
        description="Update the details for this wholesaler"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isUpdating}
        onSubmit={handleSubmit}
        submitLabel="Update Wholesaler"
        onCancel={() => router.back()}
        cardClassName="max-w-4xl"
        ref={formRef}
      />
    </div>
  )
}

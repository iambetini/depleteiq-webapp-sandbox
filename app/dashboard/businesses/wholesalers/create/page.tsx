"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { userFullNameEmailFormatter } from "@/lib/label-formatters"
import { catchError } from "@/lib/utils"
import { useCreateWholesalerMutation } from "@/store/wholesalers"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { SelectWithFetch } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { FieldArray } from "formik"
import * as Yup from "yup"

export default function CreateWholesalerPage() {
  const router = useRouter()
  const [createWholesaler, { isLoading }] = useCreateWholesalerMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    business_name: "",
    business_address: "",
    tpe_user_id: "",
    send_notification: false,
    stores: [
      {
        address: "",
        type: "",
        category: "",
        market_id: "",
      }
    ],
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    password: Yup.string().required("Password is required"),
    business_name: Yup.string().required("Business name is required"),
    business_address: Yup.string().required("Business address is required"),
    tpe_user_id: Yup.string().nullable(),
    send_notification: Yup.boolean(),
    stores: Yup.array().of(
      Yup.object().shape({
        address: Yup.string().nullable(),
        type: Yup.string().nullable(),
        category: Yup.string().nullable(),
        market_id: Yup.string().nullable(),
      })
    ),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createWholesaler(values).unwrap()
      toast({
        title: "Success",
        description: "Wholesaler created successfully",
      })
      helpers.resetForm()
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
      required: true,
      placeholder: "Enter business name",
      section: "Business Information",
    },
    {
      name: "business_address",
      label: "Address",
      type: "text" as const,
      required: true,
      placeholder: "Enter business address",
      section: "Business Information",
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter first name",
      section: "User Information",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter last name",
      section: "User Information",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Enter email address",
      section: "User Information",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: true,
      placeholder: "Enter phone number (international format)",
      section: "User Information",
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
      placeholder: "Enter password",
      section: "User Information",
    },
    {
      name: "tpe_user_id",
      label: "TPE",
      type: "selectWithFetch" as const,
      required: false,
      fetchUrl: "/users?roles=tpe",
      valueKey: "uuid",
      labelFormatter: userFullNameEmailFormatter,
      placeholder: "Select TPE user",
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
                onClick={() => push({ address: "", type: "", category: "", market_id: "" })}
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

  return (
    <div>
      <ViewPageHeader
        title="Create Wholesaler"
        description="Add a new wholesaler to the system"
      />
      <UserForm
        title="Create Wholesaler"
        description="Enter the details for the new wholesaler"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Wholesaler"
        onCancel={() => router.back()}
        cardClassName="max-w-4xl"
        ref={formRef}
      />
    </div>
  )
}

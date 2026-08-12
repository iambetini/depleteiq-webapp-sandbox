"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRoles } from "@/components/dashboard/RolesContext"
import UserForm from "@/components/dashboard/UserForm"
import { handleDelete } from "@/lib/handleDelete"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateVSSMutation } from "@/store/vss"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import * as Yup from "yup"
import { useVssData } from "@/hooks/use-entity-data"
import { Edit, MapPin, Shield, Trash2, User } from "lucide-react"

export default function ManageVssPage() {
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    market_id: "",
    role_id: "",
    status: "active",
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const { roles, isLoading: isRolesLoading } = useRoles()
  const { entity: vss, refetch } = useVssData()
  const router = useRouter()
  const [updateVSS] = useUpdateVSSMutation()

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "vss",
      uuid,
      entityLabel: "VSS",
      onSuccess: () => router.push("/dashboard/field-agents/vss"),
    })
  }, [router])

  useEffect(() => {
    if (vss && roles.length > 0) {
      setInitialValues({
        first_name: vss.first_name,
        last_name: vss.last_name,
        email: vss.email,
        phone: vss.phone,
        market_id: vss.market?.uuid || "",
        role_id: vss.role?.uuid || "",
        status: vss.status,
      })
    }
  }, [vss, roles])

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Please enter a valid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    market_id: Yup.string(),
    role_id: Yup.string().required("Role is required"),
    status: Yup.string().oneOf(["active", "inactive"]).required(),
  })

  const fields = useMemo(() => [
    {
      name: "first_name",
      label: "First Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter first name",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter last name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email" as const,
      required: true,
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text" as const,
      required: true,
      placeholder: "Enter phone number",
    },
    {
      name: "role_id",
      label: "Role",
      type: "select" as const,
      required: true,
      placeholder: "Select role",
      options: roles
        .filter((role) => role.name.toLowerCase() === "vss")
        .map((role) => ({
          label: role.name,
          value: role.uuid,
        })),
    },
    {
      name: "market_id",
      label: "Market",
      type: "selectWithFetch" as const,
      required: false,
      placeholder: "Select market",
      store: "markets",
      valueKey: "uuid",
      labelKey: "name",
      initialSearch: vss?.market?.name || "",
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      placeholder: "Select status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ], [roles, vss])

  if (!vss) { return null; }

  const handleSubmit = async (values: typeof initialValues, { setSubmitting, setFieldError }: any) => {
    try {
      await updateVSS({ id: vss.uuid, data: values }).unwrap()
      toast({
        title: "Success",
        description: "VSS updated successfully",
      })
      refetch() // Refresh the data
      setIsEditMode(false)
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteClick = () => {
    if (!vss) return;
    deleteHandler(vss.uuid);
  }

  if (isEditMode) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#444444]">Edit VSS</h2>
            <p className="text-[#ababab]">Update the VSS information below</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditMode(false)}
          >
            Cancel
          </Button>
        </div>

        <UserForm
          title="VSS Information"
          description="Update the VSS details below"
          initialValues={initialValues}
          validationSchema={validationSchema}
          fields={fields}
          isLoading={false}
          onSubmit={handleSubmit}
          submitLabel="Update VSS"
          onCancel={() => setIsEditMode(false)}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#444444]">Manage VSS</h2>
          <p className="text-[#ababab]">View and manage VSS information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-[#444444] flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </div>
            <Badge
              variant={vss?.status === "active" ? "default" : "destructive"}
              className={`status ${vss?.status === "active" ? "active" : "inactive"} mt-1`}
            >
              {vss?.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#ababab]">Full Name</p>
                <p className="font-medium text-[#444444]">
                  {vss?.first_name} {vss?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Email</p>
                <p className="font-medium text-[#444444]">{vss?.email}</p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Phone</p>
                <p className="font-medium text-[#444444]">{vss?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Created</p>
                <p className="font-medium text-[#444444]">{vss?.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role and Market Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Market Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Role</p>
                  <p className="font-medium text-[#444444]">{vss?.role?.name || "No Role"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Market</p>
                  <p className="font-medium text-[#444444]">{vss?.market?.name || "No Market"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

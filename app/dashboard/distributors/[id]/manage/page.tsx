"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import UserForm from "@/components/dashboard/UserForm"
import { createAddressFieldConfig } from "@/lib/field-configs"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { toast } from "@/hooks/use-toast"
import { useUpdateDistributorMutation } from "@/store/distributors"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import * as Yup from "yup"
import { useDistributorData } from "@/hooks/use-entity-data"
import { catchError } from "@/lib/utils"
import { Building, CreditCard, Edit, Mail, Phone, Trash2, User } from "lucide-react"

interface Distributor {
  first_name: string
  last_name: string
  email: string
  phone: string
  business_name: string
  address: string
  ime_vss_user_id: string
  send_notification: boolean
  category: string
}

export default function ManageDistributorPage() {
  const router = useRouter()
  const { entity: distributor, refetch } = useDistributorData()
  const [updateDistributorMutation] = useUpdateDistributorMutation()
  const [isEditMode, setIsEditMode] = useState(false)

  const deleteConfirmation = useDeleteConfirmation({
    storeName: "distributors",
    entityLabel: "distributor",
    onSuccess: () => router.push("/dashboard/distributors"),
  })

  const initialValues = useMemo<Distributor>(() => {
    if (!distributor) {
      return {
        first_name: "",
        last_name: "",
        category: "",
        email: "",
        phone: "",
        business_name: "",
        address: "",
        ime_vss_user_id: "",
        send_notification: false,
      }
    }

    return {
      first_name: distributor.user?.first_name || "",
      last_name: distributor.user?.last_name || "",
      category: distributor.category || "",
      email: distributor.user?.email || "",
      phone: distributor.user?.phone || "",
      business_name: distributor.business_name || "",
      address: distributor.address || "",
      ime_vss_user_id: distributor.ime_vss?.uuid || "",
      send_notification: false,
    }
  }, [distributor])

  const validationSchema = useMemo(() => Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    category: Yup.string().required("Category is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string(),
    business_name: Yup.string().required("Business name is required"),
    address: Yup.string().required("Address is required"),
    ime_vss_user_id: Yup.string().required("IME VSS User is required"),
    send_notification: Yup.boolean(),
  }), [])

  const handleSubmit = useCallback(async (values: Distributor, { setSubmitting, setFieldError }: any) => {
    try {
      distributor && await updateDistributorMutation({ id: distributor.uuid, data: values }).unwrap();
      toast({
        title: "Success",
        description: "Distributor updated successfully",
      });
      refetch(); // Refresh the data
      setIsEditMode(false);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [distributor?.uuid, distributor, refetch, updateDistributorMutation])

  const handleDeleteClick = useCallback(() => {
    if (!distributor) return;
    deleteConfirmation.showDeleteConfirmation(distributor.uuid);
  }, [distributor, deleteConfirmation])

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    {
      name: "business_name",
      label: "Business Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter business name",
    },
    {
      name: "category",
      label: "Category",
      type: "text" as const,
      required: true,
      placeholder: "Enter category",
    },
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
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Enter email",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number",
    },
    {
      name: "ime_vss_user_id",
      label: "Assign IME/VSS Team",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/users?roles=ime,vss",
      valueKey: "uuid",
      labelKey: "email",
      placeholder: "Select IME/VSS user",
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "textarea", 3),
  ]

  if (!distributor) {
    return <div>Loading...</div>
  }

  if (isEditMode) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#444444]">Edit Distributor</h2>
            <p className="text-[#ababab]">Update the distributor information below</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditMode(false)}
          >
            Cancel
          </Button>
        </div>

        <FormWithLocationModal>
          {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
            <UserForm
              title="Distributor Information"
              description="Update the distributor details below"
              initialValues={initialValues}
              validationSchema={validationSchema}
              fields={createFields(setLocationModalOpen)}
              isLoading={false}
              onSubmit={handleSubmit}
              submitLabel="Update Distributor"
              onCancel={() => setIsEditMode(false)}
              cardClassName="max-w-4xl"
              onFieldUpdate={onFieldUpdate}
              ref={setFormRef}
            />
          )}
        </FormWithLocationModal>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#444444]">Manage Distributor</h2>
          <p className="text-[#ababab]">View and manage distributor information</p>
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
        {/* Business and Contact Information */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-[#444444] flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </div>
            {distributor.user && (
              <Badge
                variant={distributor.user.status === "active" ? "default" : "destructive"}
                className={`status ${distributor.user.status === "active" ? "active" : "inactive"} mt-1`}
              >
                {distributor.user.status}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#ababab]">Business Name</p>
                <p className="font-medium text-[#444444]">{distributor.business_name}</p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Category</p>
                <p className="font-medium text-[#444444]">{distributor.category || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Contact Person</p>
                <p className="font-medium text-[#444444]">
                  {distributor.user?.first_name} {distributor.user?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">IME/VSS Team</p>
                <p className="font-medium text-[#444444]">
                  {distributor.ime_vss?.email || "Not assigned"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[#ababab]">Address</p>
              <p className="font-medium text-[#444444]">{distributor.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Email</p>
                  <p className="font-medium text-[#444444]">{distributor.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Phone</p>
                  <p className="font-medium text-[#444444]">{distributor.user?.phone || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information */}
        {(distributor.bank_name || distributor.account_number || distributor.account_name) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#444444] flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {distributor.bank_name && (
                  <div>
                    <p className="text-sm text-[#ababab]">Bank Name</p>
                    <p className="font-medium text-[#444444]">{distributor.bank_name}</p>
                  </div>
                )}
                {distributor.account_number && (
                  <div>
                    <p className="text-sm text-[#ababab]">Account Number</p>
                    <p className="font-medium text-[#444444]">{distributor.account_number}</p>
                  </div>
                )}
                {distributor.account_name && (
                  <div>
                    <p className="text-sm text-[#ababab]">Account Name</p>
                    <p className="font-medium text-[#444444]">{distributor.account_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {deleteConfirmation.pendingDelete && (
        <ConfirmationModal
          isOpen={deleteConfirmation.isModalOpen}
          onClose={deleteConfirmation.handleCancelDelete}
          onConfirm={deleteConfirmation.handleConfirmDelete}
          title={deleteConfirmation.confirmTitle || `Delete ${deleteConfirmation.pendingDelete.capitalized}`}
          description={deleteConfirmation.confirmMessage || `Are you sure you want to delete this ${deleteConfirmation.pendingDelete.displayName}? This action cannot be undone.`}
          confirmText={deleteConfirmation.confirmText}
          cancelText={deleteConfirmation.cancelText}
          variant="destructive"
          isLoading={deleteConfirmation.isDeleting}
        />
      )}
    </div>
  )
}

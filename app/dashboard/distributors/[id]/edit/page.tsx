"use client"

import UserForm from "@/components/dashboard/UserForm";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { useUpdateDistributorMutation } from "@/store/distributors";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, use } from "react";
import * as Yup from "yup";
import { useDistributorData } from "@/hooks/use-entity-data";
import { catchError } from "@/lib/utils";

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

export default function EditDistributorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const { entity: distributor } = useDistributorData()
  const [updateDistributorMutation] = useUpdateDistributorMutation()

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
      await updateDistributorMutation({ id, data: values }).unwrap();
      toast({
        title: "Success",
        description: "Distributor updated successfully",
      });
      router.push(`/dashboard/distributors/${id}`);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [id, updateDistributorMutation, router])

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
      label: "Assign IME/VSS",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/users?roles=ime,vss",
      valueKey: "uuid",
      labelKey: "email",
      placeholder: "Select IME/VSS user",
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "textarea", 3),
  ]

  return (
    <div>
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
            onCancel={() => router.back()}
            cardClassName="max-w-4xl"
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </div>
  )
}
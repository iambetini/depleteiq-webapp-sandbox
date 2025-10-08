"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { BranchForm } from "@/components/dashboard/BranchForm"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import { createAddressFieldConfig } from "@/lib/field-configs"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateBranchMutation } from "@/store/branches"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

export default function CreateBranchPage() {
  const router = useRouter()
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation()

  const initialValues = {
    branch_name: "",
    branch_code: "",
    location_id: "",
    address: "",
  }

  const validationSchema = Yup.object({
    branch_name: Yup.string().required("Branch name is required"),
    branch_code: Yup.string().required("Branch code is required"),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createBranch(values).unwrap()
      toast({
        title: "Success",
        description: "Branch created successfully",
      })
      helpers.resetForm()
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    { 
      name: "branch_name", 
      label: "Branch Name", 
      type: "text" as const, 
      required: true, 
      placeholder: "Branch Name" 
    },
    { 
      name: "branch_code", 
      label: "Branch Code", 
      type: "text" as const, 
      required: true, 
      placeholder: "Branch Code" 
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "text"),
  ]

  return (
    <>
      <ViewPageHeader title="Create Branch" description="Add a new branch to the system" />
      <FormWithLocationModal>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <BranchForm
            title="Branch Information"
            description="Add a new branch to the system"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isCreating}
            onSubmit={handleSubmit}
            submitLabel="Create Branch"
            onCancel={() => router.back()}
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </>
  )
}

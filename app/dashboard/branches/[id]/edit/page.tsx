"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import BranchForm from "@/components/dashboard/BranchForm";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useUpdateBranchMutation } from "@/store/branches";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import * as Yup from "yup";
import { useContext } from "../layout";

export default function EditBranchPage() {
  const { branch, isLoading } = useContext();
  const router = useRouter()
  const [updateBranch] = useUpdateBranchMutation()

  const validationSchema = useMemo(() => Yup.object({
    branch_name: Yup.string().required("Branch name is required"),
    branch_code: Yup.string().required("Branch code is required"),
  }), []);

  // Create initial values with address field
  const initialValues = useMemo(() => {
    if (!branch) return null;
    
    const addressParts = [
      branch.location?.street,
      branch.location?.city,
      branch.location?.state,
      branch.location?.country,
      branch.location?.postal_code,
    ].filter(Boolean);
    
    return {
      branch_name: branch.branch_name,
      branch_code: branch.branch_code,
      location_id: branch.location?.uuid || "",
      address: addressParts.join(", ") || "",
    };
  }, [branch]);

  const handleSubmit = useCallback(async (values: any, { setSubmitting, setFieldError }: any) => {
    try {
      const payload = {
        branch_name: values.branch_name,
        branch_code: values.branch_code,
        location_id: values.location?.uuid || values.location_id,
      };
      await updateBranch({ id: branch.uuid, data: payload }).unwrap();
      toast({ title: "Success", description: "Branch updated successfully" });
      router.push(`/dashboard/branches/${branch.uuid}`);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [branch, updateBranch, router]);

  if (!branch || !initialValues) { return null; }

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
  ];

  return (
    <>
      <ViewPageHeader
        title="Update Branch"
        description="Edit branch information below"
      />
      <FormWithLocationModal existingLocationData={branch.location}>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <BranchForm
            title="Update Branch"
            description="Edit branch information below"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            submitLabel="Update Branch"
            onCancel={() => router.back()}
            cardClassName="max-w-2xl"
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </>
  )
}

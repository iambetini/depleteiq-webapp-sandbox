"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import BranchForm from "@/components/dashboard/BranchForm";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useUpdateBranchMutation } from "@/store/branches";
import type { Branch } from "@/types/branch";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import * as Yup from "yup";
import { useContext } from "../layout";

export default function EditBranchPage() {
  const { branch, isLoading, fetchBranch } = useContext();
  const router = useRouter()
  const [updateBranch] = useUpdateBranchMutation()

  const validationSchema = useMemo(() => Yup.object({
    name: Yup.string().required("Branch name is required"),
    branch_code: Yup.string().required("Branch code is required"),
  }), []);

  const handleSubmit = useCallback(async (values: any, { setSubmitting, setFieldError }: any) => {
    try {
      const payload = {
        name: values.name,
        branch_code: values.branch_code,
        location_id: values.location?.uuid || values.location_id,
      };
      await updateBranch({ id: branch.uuid, data: payload }).unwrap();
      toast({ title: "Success", description: "Branch updated successfully" });
      fetchBranch();
      router.push(`/dashboard/branches/${branch.uuid}`);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [branch, updateBranch, fetchBranch, router]);

  if (!branch) { return null; }

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    { 
      name: "name", 
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
            initialValues={branch as Branch}
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

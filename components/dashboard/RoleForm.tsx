"use client"

import PermissionsPicker from "@/components/dashboard/PermissionsPicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { normalizePermissionsCatalog } from "@/lib/permissions-catalog"
import { catchError } from "@/lib/utils"
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/store/roles"
import { Permission, PermissionsCatalogItems } from "@/types/permission"
import { ErrorMessage, Form, Formik } from "formik"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import * as Yup from "yup"

export interface RoleFormValues {
  name: string
  description: string
  access_type: string
  permissions: string[]
}

interface RoleFormProps {
  initialValues: RoleFormValues
  isEdit?: boolean
  roleId?: string
  onSuccess?: (data: any) => void
  title: string
  description: string
  submitButtonText: string
}

export const roleValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  access_type: Yup.string().oneOf(["web", "mobile"]).required(),
  permissions: Yup.array().of(Yup.string()),
})

async function fetchPermissionsCatalog(): Promise<Permission[]> {
  const requests = [
    "/permissions?per_page=1000",
    "/permissions",
  ]

  let lastError: unknown = null

  for (const endpoint of requests) {
    try {
      const res = await apiClient.get<{ items: PermissionsCatalogItems }>(endpoint)
      if (res.status === "success") {
        return normalizePermissionsCatalog(res.data?.items)
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) throw lastError
  return []
}

export default function RoleForm({
  initialValues,
  isEdit = false,
  roleId,
  onSuccess,
  title,
  description,
  submitButtonText,
}: RoleFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const [updateRole] = useUpdateRoleMutation()
  const [createRole] = useCreateRoleMutation()

  useEffect(() => {
    let cancelled = false

    setIsLoadingPermissions(true)
    fetchPermissionsCatalog()
      .then((items) => {
        if (!cancelled) setPermissions(items)
      })
      .catch(() => {
        if (!cancelled) setPermissions([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPermissions(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (values: RoleFormValues, { setSubmitting, setFieldError, resetForm }: any) => {
    setIsLoading(true)
    try {
      const permissionsPayload: Permission[] = values.permissions.map((uuid) => ({ uuid } as Permission));
      if (isEdit && roleId) {
        await updateRole({ id: roleId, data: { ...values, permissions: permissionsPayload } }).unwrap()
        toast({
          title: "Success",
          description: "Role updated successfully"
        });
        if (onSuccess) {
          onSuccess(values);
        } else {
          router.push(`/dashboard/general-settings/roles/${roleId}`);
        }
      } else {
        await createRole({ ...values, permissions: permissionsPayload }).unwrap()
        toast({
          title: "Success",
          description: "Role created successfully"
        });
        if (onSuccess) {
          onSuccess(values);
        } else {
          resetForm();
        }
      }
    } catch (error: any) {
      catchError(error, setFieldError)
      if (error?.errors?.name) {
        setFieldError("name", error.errors.name)
      }
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="h-full min-h-0">
      <Card className="flex h-full min-h-0 max-w-6xl flex-col">
        <CardHeader className="shrink-0 px-6 py-4">
          <CardTitle className="text-xl text-[#444444]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col pt-0 pb-4">
          <Formik
            initialValues={initialValues}
            validationSchema={roleValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, handleChange, setFieldValue, isSubmitting }) => (
              <Form className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2 lg:grid-rows-1">
                  <div className="space-y-4 self-start">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Enter role name"
                      />
                      <ErrorMessage name="name" component="p" className="text-sm text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Enter description"
                      />
                      <ErrorMessage name="description" component="p" className="text-sm text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="access_type">Access Type</Label>
                      <Select
                        value={values.access_type}
                        onValueChange={(value) => setFieldValue("access_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Web</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="access_type" component="p" className="text-sm text-red-500" />
                    </div>
                  </div>
                  <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden max-lg:h-[20rem]">
                    <Label className="shrink-0">Permissions</Label>
                    <PermissionsPicker
                      permissions={permissions}
                      selectedIds={values.permissions}
                      onChange={(ids) => setFieldValue("permissions", ids)}
                      isLoading={isLoadingPermissions}
                    />
                    <ErrorMessage name="permissions" component="p" className="text-sm text-red-500" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-end space-x-4 pt-2 lg:ml-auto lg:w-1/2 lg:border-t lg:pt-3">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary" disabled={isLoading || isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading || isSubmitting ? (isEdit ? "Updating..." : "Creating...") : submitButtonText}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

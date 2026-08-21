"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordField } from "@/components/ui/password-field"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { catchError } from "@/lib/utils"
import { isWeakPassword } from "@/lib/weak-passwords"
import { Form, Formik } from "formik"
import { Key, ShieldAlert } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import * as Yup from "yup"

const INITIAL_VALUES = {
  current_password: "",
  new_password: "",
  confirm: "",
}

const VALIDATION_SCHEMA = Yup.object({
  current_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .test(
      "not-weak",
      "Password is too weak. Please choose a stronger password.",
      (value) => !isWeakPassword(value ?? "")
    )
    .required("New password is required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords must match")
    .required("Confirm your new password"),
})

export default function ChangePasswordPage() {
  const { update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const handleSubmit = async (
    values: typeof INITIAL_VALUES,
    { setFieldError }: { setFieldError: (field: string, message: string) => void }
  ) => {
    setIsLoading(true)
    setPasswordError("")
    try {
      await apiClient.post("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.confirm,
      })
      await update({ mustChangePassword: false })
      toast({ title: "Success", description: "Password updated successfully!" })
      router.push("/dashboard")
    } catch (err: any) {
      catchError(err, setFieldError)
      setPasswordError(err?.message || "Failed to change password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-lg border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Change Your Password</CardTitle>
          </div>
          <CardDescription>
            For security reasons, you must set a new password before you can continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleBlur }) => (
              <Form className="space-y-6">
                {passwordError && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{passwordError}</AlertDescription>
                  </Alert>
                )}

                <PasswordField
                  id="current_password"
                  name="current_password"
                  label="Current Password"
                  placeholder="Enter your current password"
                  value={values.current_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                />
                <PasswordField
                  id="new_password"
                  name="new_password"
                  label="New Password"
                  placeholder="Enter a new password"
                  value={values.new_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="confirm"
                  name="confirm"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={values.confirm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />

                <Button type="submit" className="w-full btn-primary h-11" disabled={isLoading}>
                  {isLoading ? "Updating Password..." : "Update Password"}
                </Button>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Log out instead
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

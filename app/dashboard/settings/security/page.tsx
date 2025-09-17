"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Lock, Shield, Key, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordField } from "@/components/ui/password-field"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { apiClient } from "@/lib/api-client"
import { catchError } from "@/lib/utils"

const PASSWORD_INITIAL_VALUES = {
  current_password: "",
  new_password: "",
  confirm: "",
}

const PASSWORD_VALIDATION_SCHEMA = Yup.object({
  current_password: Yup.string().required("Current password is required"),
  new_password: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords must match")
    .required("Confirm your new password"),
})

export default function SecuritySettingsPage() {
  const { data: session } = useSession()
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const handlePasswordSubmit = async (
    values: typeof PASSWORD_INITIAL_VALUES,
    { setFieldError }: { setFieldError: (field: string, message: string) => void }
  ) => {
    setIsPasswordLoading(true)
    setPasswordError("")
    try {
      await apiClient.post("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password,
      })
      toast({ title: "Success", description: "Password changed successfully!" })
    } catch (err: any) {
      catchError(err, setFieldError)
      setPasswordError(err?.message || "Failed to change password.")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading security settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Security Center</h1>
            <p className="text-red-100 text-lg mt-1">Protect your account with strong security measures</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Password Change Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Key className="h-4 w-4 text-red-600" />
                </div>
                <CardTitle className="text-lg">Change Password</CardTitle>
              </div>
              <CardDescription>Update your account password to keep it secure</CardDescription>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={PASSWORD_INITIAL_VALUES}
                validationSchema={PASSWORD_VALIDATION_SCHEMA}
                onSubmit={handlePasswordSubmit}
              >
                {({ values, handleChange, handleBlur }) => (
                  <Form className="space-y-6">
                    {passwordError && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
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
                      placeholder="Enter your new password"
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

                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-11" 
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? "Updating Password..." : "Update Password"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>

        {/* Security Information */}
        <div className="space-y-6">

          {/* Security Tips */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Security Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span>Use a unique password for this account</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span>Include numbers, symbols, and mixed case</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span>Change your password regularly</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                  <span>Never share your password with others</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

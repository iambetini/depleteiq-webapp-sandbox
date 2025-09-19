"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default function ProfileSettingsPage() {
  const { data: session } = useSession()

  const roleDisplay = useMemo(() => {
    const r = session?.user?.role || ""
    return r ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() : "Unknown"
  }, [session?.user?.role])

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {session.user.first_name && session.user.last_name 
                ? `${session.user.first_name} ${session.user.last_name}`
                : session.user.email
              }
            </h1>
            <p className="text-orange-100 text-lg mt-1">{session.user.email}</p>
            <Badge className="bg-white/20 text-white border-white/30 mt-2 backdrop-blur-sm">
              {roleDisplay}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {session.user.first_name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {session.user.last_name || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </div>
            <CardDescription>Your contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{session.user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </div>
            <CardDescription>Your account permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <div className="mt-2">
                <Badge className="bg-orange-500 text-white px-3 py-1 text-sm font-medium">
                  {roleDisplay}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <CardTitle className="text-lg">Account Activity</CardTitle>
            </div>
            <CardDescription>Recent account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-2">
                <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-medium">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

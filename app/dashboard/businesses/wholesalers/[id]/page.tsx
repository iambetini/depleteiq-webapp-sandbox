"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Mail, MapPin, Phone, User, Users } from "lucide-react";
import Link from "next/link";
import { ViewPageHeader } from "@/components/dashboard/ViewPageHeader";
import { useContext } from "./layout";

export default function ViewWholesalerPage() {
  const { wholesaler, isLoading } = useContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!wholesaler) {
    return null
  }

  const stores = (wholesaler.stores ?? []) as Array<{
    uuid?: string
    address?: string
    type?: string
    category?: string
    market?: { name?: string }
  }>

  return (
    <div>
      <ViewPageHeader
        title={wholesaler.name || "Wholesaler"}
        description="Wholesaler Details"
        showEditButton={true}
        editHref={`/dashboard/businesses/wholesalers/${wholesaler.uuid}/edit`}
        showDeleteButton={true}
        deleteOptions={{
          storeName: "businesses",
          uuid: wholesaler.uuid,
          redirectPath: "/dashboard/businesses/wholesalers",
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-[#444444]">Business Information</CardTitle>
              </div>
              {wholesaler.user && (
                <Badge
                  variant={wholesaler.user.status === "active" ? "default" : "destructive"}
                  className={`status ${wholesaler.user.status === "active" ? "active" : "inactive"}`}
                >
                  {wholesaler.user.status}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Business Name</p>
                    <p className="font-medium text-[#444444]">{wholesaler.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#ababab]">Business Type</p>
                  <Badge variant="secondary" className="mt-1">
                    {wholesaler.type}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-[#ababab] mt-1" />
                  <div>
                    <p className="text-sm text-[#ababab]">Address</p>
                    <p className="font-medium text-[#444444]">{wholesaler.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#444444]">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Contact Person</p>
                    <p className="font-medium text-[#444444]">
                      {wholesaler.user?.first_name} {wholesaler.user?.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Email</p>
                    <p className="font-medium text-[#444444]">{wholesaler.user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Phone</p>
                  <p className="font-medium text-[#444444]">{wholesaler.user?.phone || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#444444]">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">TPE User</p>
                  {wholesaler.tpe_user?.uuid ? (
                    <Link
                      href={`/dashboard/field-agents/tpe/${wholesaler.tpe_user.uuid}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {wholesaler.tpe_user.first_name} {wholesaler.tpe_user.last_name}
                    </Link>
                  ) : (
                    <p className="font-medium text-[#444444]">Not assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attached Stores Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#444444]">Attached Stores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stores.map((store, index) => (
                    <div key={store.uuid || index} className="p-4 border rounded-md bg-gray-50 space-y-2">
                      <h4 className="font-medium text-[#444444]">Store {index + 1}</h4>
                      {store.address && (
                        <div className="text-sm">
                          <span className="text-[#ababab]">Address:</span> <span className="text-[#444444]">{store.address}</span>
                        </div>
                      )}
                      {store.type && (
                        <div className="text-sm">
                          <span className="text-[#ababab]">Type:</span> <span className="text-[#444444]">{store.type}</span>
                        </div>
                      )}
                      {store.category && (
                        <div className="text-sm">
                          <span className="text-[#ababab]">Category:</span> <span className="text-[#444444]">{store.category}</span>
                        </div>
                      )}
                      {store.market && (
                        <div className="text-sm">
                          <span className="text-[#ababab]">Market:</span> <span className="text-[#444444]">{store.market.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#ababab]">No stores attached</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

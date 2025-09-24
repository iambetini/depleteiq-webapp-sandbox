"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, CreditCard, Mail, MapPin, Phone, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { memo } from "react";
import { useDistributorData } from "@/hooks/use-entity-data";
import PerformanceMetricsCard from "@/components/dashboard/PerformanceMetricsCard";

const BusinessAndContactInformationCard = memo(() => {
  const { entity: distributor } = useDistributorData()

  if (!distributor) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-[#444444]">Distributor Details</CardTitle>
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
          <div className="flex items-center space-x-3">
            <Building className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Business Name</p>
              <p className="font-medium text-[#444444]">{distributor.business_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Contact Person</p>
              <p className="font-medium text-[#444444]">
                {distributor.user?.first_name} {distributor.user?.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">IME/VSS</p>
              {distributor.ime_vss?.uuid ? (
                <Link
                  href={`/dashboard/ime-vss/${distributor.ime_vss.uuid}`}
                  className="font-medium text-[#444444] hover:underline"
                >
                  {distributor.ime_vss.first_name} {distributor.ime_vss.last_name} ({distributor.ime_vss.email})
                </Link>
              ) : (
                <p className="font-medium text-[#444444]">Not assigned</p>
              )}
            </div>
          </div>
          <div className="hidden items-center space-x-0">
            <Badge variant="secondary">{distributor.business_type}</Badge>
          </div>
          <RegistrationInfo />
        </div>
        {distributor.user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Email</p>
                <p className="font-medium text-[#444444]">{distributor.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Phone</p>
                <p className="font-medium text-[#444444]">{distributor.user.phone}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 md:col-span-2">
            <MapPin className="h-5 w-5 text-[#ababab] mt-1" />
            <div>
              <p className="text-sm text-[#ababab]">Address</p>
              <p className="font-medium text-[#444444]">{distributor.address}</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
})
BusinessAndContactInformationCard.displayName = 'BusinessAndContactInformationCard'

const RegistrationInfo = memo(() => {
  const { entity: distributor } = useDistributorData()

  if (!distributor?.registration_number && !distributor?.tax_id) return null

  return (
    <>
      {distributor.registration_number && (
        <div>
          <p className="text-sm text-[#ababab]">Registration Number</p>
          <p className="font-medium text-[#444444]">{distributor.registration_number}</p>
        </div>
      )}
      {distributor.tax_id && (
        <div>
          <p className="text-sm text-[#ababab]">Tax ID</p>
          <p className="font-medium text-[#444444]">{distributor.tax_id}</p>
        </div>
      )}
    </>
  )
})
RegistrationInfo.displayName = 'RegistrationInfo'

const BankingInformationCard = memo(() => {
  const { entity: distributor } = useDistributorData()

  if (!distributor?.bank_name && !distributor?.account_number) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#444444]">Banking Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {distributor.bank_name && (
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Bank Name</p>
                <p className="font-medium text-[#444444]">{distributor.bank_name}</p>
              </div>
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
  )
})
BankingInformationCard.displayName = 'BankingInformationCard'



export default function DistributorDetailPage() {
  const router = useRouter()
  const { entity: distributor, performance } = useDistributorData()

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BusinessAndContactInformationCard />
          <BankingInformationCard />
        </div>

        <div>
          <PerformanceMetricsCard
            totalOrders={performance?.total_orders || 0}
            totalOrderValue={performance?.total_order_value || 0}
            targetVolume={performance?.target_volume || 0}
          />
        </div>
      </div>
    </div>
  )
}

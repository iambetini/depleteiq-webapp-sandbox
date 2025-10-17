"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { useSession } from "next-auth/react";
import { useContext } from "./layout";
import { Map } from "@/components/ui/map";
import { MapPin, Navigation, Calendar, Building2 } from "lucide-react";

export default function BranchDetailPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { branch } = useContext();

  if (!branch) { return null; }

  const userRole = user?.role?.name?.toLowerCase() || "";
  const latNum = Number(branch?.location?.latitude) || undefined;
  const lngNum = Number(branch?.location?.longitude) || undefined;

  return (
    <div>
      <ViewPageHeader
        title="Branch Details"
        description={`Branch Code: ${branch.branch_code}`}
        showEditButton={true}
        editHref={`/dashboard/branches/${branch.uuid}/edit`}
        showDeleteButton={["admin", "super-admin","manager"].includes(userRole)}
        deleteOptions={{
          storeName: "branches",
          uuid: branch.uuid,
        }}
      />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Information + Map grid (mirrors Locations page) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#444444]">Branch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Branch Name</p>
                    <p className="font-medium text-[#444444]">{branch.branch_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Branch Code</p>
                    <p className="font-medium text-[#444444]">{branch.branch_code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Location</p>
                    <p className="font-medium text-[#444444]">{branch.location?.full_location || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Navigation className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Coordinates</p>
                    <p className="font-medium text-[#444444]">
                      {latNum != null && lngNum != null
                        ? `${lngNum.toFixed(6)}, ${latNum.toFixed(6)}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Created</p>
                    <p className="font-medium text-[#444444]">{branch.created_at}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Card */}
          {latNum != null && lngNum != null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#444444] flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Branch Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Map
                  latitude={latNum}
                  longitude={lngNum}
                  title={`Branch ${branch.branch_code}`}
                  height="400px"
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

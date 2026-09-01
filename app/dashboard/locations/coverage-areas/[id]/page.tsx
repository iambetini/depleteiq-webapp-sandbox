"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContext } from "./layout"
import { handleDelete } from "@/lib/handleDelete"
import { ArrowLeft, Calendar, Edit, Map, MapPin, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export default function CoverageAreaDetailPage() {
  const router = useRouter()
  const { coverageArea } = useContext()

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "coverageAreas",
      uuid,
      onSuccess: () => router.push("/dashboard/locations/coverage-areas"),
    })
  }, [router])

  if (!coverageArea) { return null; }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#444444]">
              {coverageArea.name}
            </h1>
            <p className="text-[#ababab]">Coverage Area Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/locations/coverage-areas/${coverageArea.uuid}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => deleteHandler(coverageArea.uuid)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Coverage Area Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Coverage Area Name</p>
                <p className="font-medium text-[#444444]">{coverageArea.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">LGA</p>
                <p className="font-medium text-[#444444]">{coverageArea.lga?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Map className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Geofence</p>
                <p className="font-medium text-[#444444]">
                  {coverageArea.geofence?.name || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Map className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Geofence Status</p>
                {coverageArea.enable_geofence ? (
                  <Badge variant="info">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Created</p>
                <p className="font-medium text-[#444444]">{coverageArea.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {coverageArea.geofence && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#444444] flex items-center space-x-2">
                <Map className="h-5 w-5" />
                <span>Geofence Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Geofence Name</p>
                  <p className="font-medium text-[#444444]">{coverageArea.geofence.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Description</p>
                  <p className="font-medium text-[#444444]">
                    {coverageArea.geofence.description || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Type</p>
                  <p className="font-medium text-[#444444]">{coverageArea.geofence.type}</p>
                </div>
              </div>
              {coverageArea.geofence.center_latitude != null && coverageArea.geofence.center_longitude != null && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Center Coordinates</p>
                    <p className="font-medium text-[#444444]">
                      {coverageArea.geofence.center_latitude}, {coverageArea.geofence.center_longitude}
                    </p>
                  </div>
                </div>
              )}
              {coverageArea.geofence.radius != null && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#ababab]" />
                  <div>
                    <p className="text-sm text-[#ababab]">Radius</p>
                    <p className="font-medium text-[#444444]">{coverageArea.geofence.radius} m</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

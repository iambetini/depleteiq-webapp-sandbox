"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContext } from "./layout"
import { handleDelete } from "@/lib/handleDelete"
import { ArrowLeft, Calendar, Edit, MapPin, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export default function StateDetailPage() {
  const router = useRouter()
  const { state } = useContext()

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "states",
      uuid,
      onSuccess: () => router.push("/dashboard/locations/states"),
    })
  }, [router])

  if (!state) { return null; }

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
              {state.name}
            </h1>
            <p className="text-[#ababab]">State Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/locations/states/${state.uuid}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => deleteHandler(state.uuid)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">State Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">State Name</p>
                <p className="font-medium text-[#444444]">{state.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Region</p>
                {state.region ? (
                  <Badge variant="secondary">{state.region.name}</Badge>
                ) : (
                  <p className="font-medium text-[#444444]">—</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Created</p>
                <p className="font-medium text-[#444444]">{state.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
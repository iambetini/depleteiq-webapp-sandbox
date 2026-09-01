"use client";

import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import GeofenceMapPicker from "@/components/geofences/GeofenceMapPicker";
import { useContext } from "./layout";

/** Normalize API polygon (string or array) to number[][] for map/display */
function polygonToPoints(
  polygon: string | number[][] | null | undefined
): number[][] {
  if (polygon == null) return [];
  if (Array.isArray(polygon)) return polygon;
  try {
    const parsed = JSON.parse(polygon || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function GeofenceDetailPage() {
  const { geofence } = useContext();

  if (!geofence) {
    return null;
  }

  const polygonPoints = polygonToPoints(geofence.polygon);

  const latitude =
    geofence.center_latitude != null
      ? Number(geofence.center_latitude)
      : null;
  const longitude =
    geofence.center_longitude != null
      ? Number(geofence.center_longitude)
      : null;
  const radius =
    geofence.radius != null && geofence.radius !== ""
      ? Number(geofence.radius)
      : null;
  const polygon =
    polygonPoints.length > 0 ? polygonPoints : null;

  return (
    <div className="space-y-6">
      <ViewPageHeader
        title={geofence.name}
        description="Geofence details"
        showEditButton
        editHref={`/dashboard/geofences/${geofence.uuid}/edit`}
        showDeleteButton
        deleteOptions={{
          storeName: "geofences",
          uuid: geofence.uuid,
        }}
      />

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <InfoRow label="Type" value={geofence.type} />
              <InfoRow label="Description" value={geofence.description} />
              <InfoRow label="Latitude" value={geofence.center_latitude} />
              <InfoRow label="Longitude" value={geofence.center_longitude} />
              <InfoRow label="Radius" value={geofence.radius} />
              <InfoRow
                label="Polygon Points"
                value={`${polygonPoints.length}`}
              />
              <InfoRow label="Created" value={geofence.created_at} />
              <InfoRow
                label="Updated"
                value={geofence.updated_at ? geofence.updated_at : undefined}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Geofence Map</CardTitle>
        </CardHeader>
        <CardContent>
          <GeofenceMapPicker
            type={geofence.type === "circle" ? "circle" : "polygon"}
            latitude={latitude}
            longitude={longitude}
            radius={radius}
            polygon={polygon}
            showClearButton={false}
            isReadOnly
            onShapeChange={() => {}}
            onClear={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <TableRow>
      <TableCell className="w-48 font-medium text-muted-foreground">
        {label}
      </TableCell>
      <TableCell>{value ?? "-"}</TableCell>
    </TableRow>
  );
}

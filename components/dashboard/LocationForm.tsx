"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GooglePlacesAutocomplete } from "@/components/ui/google-places-autocomplete";
import { Label } from "@/components/ui/label";
import { LocationMap } from "@/components/ui/location-map";
import { Form, Formik } from "formik";
import { MapPin, Save } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";

interface LocationFormProps {
  initialValues: {
    street: string;
    city: string;
    state: string;
    region: string;
    country: string;
    postal_code: string;
    latitude: number | string;
    longitude: number | string;
  };
  validationSchema: Yup.ObjectSchema<any>;
  isLoading: boolean;
  onSubmit: (values: any, helpers: any) => void;
  submitLabel: string;
  title: string;
  description: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function LocationForm({
  initialValues,
  validationSchema,
  isLoading,
  onSubmit,
  submitLabel,
  title,
  description,
  onCancel,
  onSuccess,
}: LocationFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const handleFormSubmit = async (values: any, helpers: any) => {
    try {
      await onSubmit(values, helpers);
      setSelectedLocation("");
      onSuccess?.();
    } catch (error) {
      throw error;
    }
  };


  return (
    <Card className="max-w-full mx-0">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-[#ff6600]" />
          </div>
          {title}
        </CardTitle>
        <CardDescription className="text-base mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ values, handleChange, setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="space-y-8">
              <div className="flex space-x-4">
                {/* Location Search Section */}
                <div className="w-full bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-6 border border-primary-100">
                  <div className="space-y-4">

                    <GooglePlacesAutocomplete
                      onLocationSelect={(location) => {
                        // Auto-fill all fields when location is selected
                        setFieldValue("street", location.street);
                        setFieldValue("city", location.city);
                        setFieldValue("state", location.state);
                        setFieldValue("region", location.region);
                        setFieldValue("country", location.country);
                        setFieldValue("postal_code", location.postal_code);
                        setFieldValue("latitude", location.latitude);
                        setFieldValue("longitude", location.longitude);
                        setSelectedLocation(location.formatted_address);
                      }}
                      initialValue={selectedLocation}
                      placeholder="Type to search for a location..."
                      label="Enter address and select option to autofill the form below"
                      className="bg-white"
                    />

                    {/* Map Display */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Location Preview</Label>
                      <LocationMap
                        latitude={values.latitude || 0}
                        longitude={values.longitude || 0}
                        address={selectedLocation || `${values.street}, ${values.city}, ${values.state}, ${values.country}`.replace(/^,\s*|,\s*$/g, '')}
                        height="280px"
                        className="rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Details Section */}
                <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                    {selectedLocation && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        ✓ Auto-filled
                      </span>
                    )}
                  </div>

                  {!selectedLocation && (
                    <div className="mb-6 p-4 bg-[#ff660010] border border-[#ff660050] rounded-lg">
                      <p className="text-sm text-[#00000090]">
                        <strong>Tip:</strong> Search for a location to automatically fill in all the details below.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Street Address:</Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900">{values.street || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">City:</Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900">{values.city || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">State/Province:</Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900">{values.state || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Region:</Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900">{values.region || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Country:</Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900">{values.country || "Not specified"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Postal Code:</Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900">{values.postal_code || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        Latitude:
                      </Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900 font-mono">
                          {values.latitude ? Number(values.latitude).toFixed(6) : "Not specified"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        Longitude:
                      </Label>
                      <div className="px-2 py-1 flex items-center">
                        <span className="text-gray-900 font-mono">
                          {values.longitude ? Number(values.longitude).toFixed(6) : "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="h-11 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 px-6 btn-primary hover:bg-primary-700 text-white"
                  disabled={isLoading || isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading || isSubmitting ? submitLabel + "..." : submitLabel}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}

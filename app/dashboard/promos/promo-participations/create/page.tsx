"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectWithFetch } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ErrorMessage, Form, Formik } from "formik";
import { Save, Loader2, Upload, Eye } from "lucide-react";
import { ItemsFieldArray } from "@/components/dashboard/ItemsFieldArray";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useCreatePromoParticipationMutation } from "@/store/promo-participations";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useRef, useState } from "react";
import Image from "next/image";
import * as Yup from "yup";

export default function CreatePromoParticipationPage() {
  const router = useRouter()
  const [createPromoParticipation, { isLoading }] =
    useCreatePromoParticipationMutation()
  const { uploadImage, isUploading, previewUrl, setPreviewUrl, clearPreview } = useImageUpload({
    folder: 'promo-receipts',
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*'],
    provider: 'aws-s3-proxy',
    showToast: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hasImageChanged, setHasImageChanged] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelection = (file: File) => {
    setSelectedFile(file)
    setHasImageChanged(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const initialValues = {
    participant_id: "",
    promo_id: "",
    promoter_id: "",
    store_id: "",
    participate_in_promo: false,
    receipt_image: "",
    item_purchased: [{ name: "", quantity: 1 }],
    item_gifted: [{ name: "", quantity: 1 }],
  }

  const validationSchema = Yup.object({
    participant_id: Yup.string().required("Participant is required"),
    promo_id: Yup.string().required("Promo is required"),
    promoter_id: Yup.string().required("Promoter is required"),
    store_id: Yup.string().required("Store is required"),
    participate_in_promo: Yup.boolean().required("Participate in promo is required"),
    receipt_image: Yup.string().nullable(),
    item_purchased: Yup.array().of(
      Yup.object({
        name: Yup.string().required("Item name is required"),
        quantity: Yup.number().min(1, "Quantity must be at least 1").required("Quantity is required"),
      })
    ),
    item_gifted: Yup.array().of(
      Yup.object({
        name: Yup.string().required("Item name is required"),
        quantity: Yup.number().min(1, "Quantity must be at least 1").required("Quantity is required"),
      })
    ),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      let finalValues = { ...values }

      // Upload image only if it has changed
      if (hasImageChanged && selectedFile) {
        finalValues.receipt_image = (await uploadImage(selectedFile)) || ""
      }

      // Convert item arrays to JSON if needed
      const submitData = {
        ...finalValues,
        item_purchased: Array.isArray(finalValues.item_purchased)
          ? finalValues.item_purchased.filter((item: any) => item.name)
          : [],
        item_gifted: Array.isArray(finalValues.item_gifted)
          ? finalValues.item_gifted.filter((item: any) => item.name)
          : [],
      }

      await createPromoParticipation(submitData).unwrap()
      toast({
        title: "Success",
        description: "Promo participation created successfully",
      })
      clearPreview()
      setSelectedFile(null)
      setHasImageChanged(false)
      helpers.resetForm()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      router.push("/dashboard/promos/promo-participations")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <div>
      <ViewPageHeader
        title="Create Promo Participation"
        description="Add a new promo participation to the system"
      />
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Create Promo Participation</CardTitle>
          <CardDescription>Enter the details for the new promo participation</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, handleChange, setFieldValue, errors, touched, isSubmitting }) => (
              <Form className="space-y-10">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#444444]">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="participant_id">
                        Participant <span className="text-[#ff0000]">*</span>
                      </Label>
                      <SelectWithFetch
                        fetchUrl="/participants"
                        value={values.participant_id}
                        onChange={(value) => setFieldValue("participant_id", value)}
                        valueKey="uuid"
                        labelKey="first_name"
                        labelFormatter={(participant: any) =>
                          `${participant.first_name} ${participant.last_name} (${participant.email})`
                        }
                        placeholder="Select participant"
                      />
                      {errors.participant_id && touched.participant_id && (
                        <ErrorMessage
                          name="participant_id"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo_id">
                        Promo <span className="text-[#ff0000]">*</span>
                      </Label>
                      <SelectWithFetch
                        fetchUrl="/promos"
                        value={values.promo_id}
                        onChange={(value) => setFieldValue("promo_id", value)}
                        valueKey="uuid"
                        labelKey="type"
                        placeholder="Select promo"
                      />
                      {errors.promo_id && touched.promo_id && (
                        <ErrorMessage
                          name="promo_id"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promoter_id">
                        Promoter <span className="text-[#ff0000]">*</span>
                      </Label>
                      <SelectWithFetch
                        fetchUrl="/promoters"
                        value={values.promoter_id}
                        onChange={(value) => setFieldValue("promoter_id", value)}
                        valueKey="uuid"
                        labelKey="uuid"
                        labelFormatter={(promoter: any) =>
                          `${promoter.user?.first_name} ${promoter.user?.last_name}`
                        }
                        placeholder="Select promoter"
                      />
                      {errors.promoter_id && touched.promoter_id && (
                        <ErrorMessage
                          name="promoter_id"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store_id">
                        Store <span className="text-[#ff0000]">*</span>
                      </Label>
                      <SelectWithFetch
                        fetchUrl="/stores"
                        value={values.store_id}
                        onChange={(value) => setFieldValue("store_id", value)}
                        valueKey="uuid"
                        labelKey="name"
                        placeholder="Select store"
                      />
                      {errors.store_id && touched.store_id && (
                        <ErrorMessage
                          name="store_id"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="participate_in_promo"
                          name="participate_in_promo"
                          type="checkbox"
                          checked={values.participate_in_promo}
                          onChange={handleChange}
                          className="h-4 w-4 border-gray-300 rounded"
                        />
                        <Label htmlFor="participate_in_promo" className="ml-2 mb-0">
                          Participate in Promo <span className="text-[#ff0000]">*</span>
                        </Label>
                      </div>
                      {errors.participate_in_promo && touched.participate_in_promo && (
                        <ErrorMessage
                          name="participate_in_promo"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Receipt Image</Label>
                      <input
                        ref={fileInputRef}
                        id="receipt_image"
                        name="receipt_image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageSelection(e.target.files[0])
                          }
                        }}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="receipt_image" className="flex items-center justify-center group cursor-pointer">
                        {isSubmitting && hasImageChanged ? (
                          <div className="w-full h-32 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        ) : previewUrl ? (
                          <div className="relative w-full">
                            <Image
                              src={previewUrl}
                              alt="Receipt Image"
                              width={300}
                              height={128}
                              className="h-32 w-full rounded-lg object-cover border-2 border-gray-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                              <span className="text-white text-sm font-semibold">Click to change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="text-center px-4">
                              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">Add Receipt Image</span>
                            </div>
                          </div>
                        )}
                      </label>
                      {previewUrl && !isSubmitting && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {hasImageChanged ? "Image selected - will upload on form submission" : "Click the image to change"}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsImageModalOpen(true)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View Full
                          </Button>
                        </div>
                      )}
                      {isSubmitting && hasImageChanged && (
                        <p className="text-sm text-gray-600">Uploading image...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Purchased */}
                <ItemsFieldArray
                  name="item_purchased"
                  label="Items Purchased"
                  items={values.item_purchased}
                  setFieldValue={setFieldValue}
                  errors={errors}
                />

                {/* Items Gifted */}
                <ItemsFieldArray
                  name="item_gifted"
                  label="Items Gifted"
                  items={values.item_gifted}
                  setFieldValue={setFieldValue}
                  errors={errors}
                />

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading || isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || isSubmitting} className="gap-2">
                    {isLoading || isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Promo Participation
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        size="lg-center"
        title="Receipt Image"
      >
        {previewUrl && (
          <div className="relative w-full h-96">
            <Image
              src={previewUrl}
              alt="Receipt Image Full View"
              fill
              className="object-contain"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

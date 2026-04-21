'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { SelectWithFetch } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { ErrorMessage, Form, Formik } from 'formik'
import { Save, Loader2, Upload, Eye } from 'lucide-react'
import { ItemsFieldArray } from '@/components/dashboard/ItemsFieldArray'
import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { toast } from '@/hooks/use-toast'
import { catchError } from '@/lib/utils'
import { useUpdatePromoParticipationMutation } from '@/store/promo-participations'
import { useRouter } from 'next/navigation'
import { useContext } from '../layout'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import * as Yup from 'yup'

export default function EditPromoParticipationPage() {
  const router = useRouter()
  const { promoParticipation, fetchEntity } = useContext()
  const [updatePromoParticipation] = useUpdatePromoParticipationMutation()
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

  useEffect(() => {
    if (promoParticipation?.receipt_image) {
      setPreviewUrl(promoParticipation.receipt_image)
      setHasImageChanged(false)
      setSelectedFile(null)
    }
  }, [promoParticipation, setPreviewUrl])

  const handleImageSelection = (file: File) => {
    setSelectedFile(file)
    setHasImageChanged(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (!promoParticipation) {
    return null
  }

  const validationSchema = Yup.object({
    participant_id: Yup.string().required('Participant is required'),
    promo_id: Yup.string().required('Promo is required'),
    promoter_id: Yup.string().required('Promoter is required'),
    store_id: Yup.string().required('Store is required'),
    receipt_image: Yup.string().nullable(),
    item_purchased: Yup.array().of(
      Yup.object({
        name: Yup.string().required('Item name is required'),
        quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
      })
    ),
    item_gifted: Yup.array().of(
      Yup.object({
        name: Yup.string().required('Item name is required'),
        quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
      })
    ),
  })

  const handleSubmit = async (values: any, helpers: any) => {
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

      await updatePromoParticipation({ id: promoParticipation.uuid, data: submitData }).unwrap()
      toast({
        title: 'Success',
        description: 'Promo participation updated successfully',
      })
      fetchEntity()
      router.push(`/dashboard/promos/promo-participations/${promoParticipation.uuid}`)
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const initialValues = {
    participant_id: promoParticipation.participant?.uuid || '',
    promo_id: promoParticipation.promo?.uuid || '',
    promoter_id: promoParticipation.promoter?.uuid || '',
    store_id: promoParticipation.store?.uuid || '',
    receipt_image: promoParticipation.receipt_image || '',
    item_purchased: Array.isArray(promoParticipation.item_purchased) ? promoParticipation.item_purchased : [],
    item_gifted: Array.isArray(promoParticipation.item_gifted) ? promoParticipation.item_gifted : [],
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Promo Participation"
        description="Update participation details"
      />
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Edit Promo Participation</CardTitle>
          <CardDescription>Update the details for this participation</CardDescription>
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
                        onChange={(value) => setFieldValue('participant_id', value)}
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
                        onChange={(value) => setFieldValue('promo_id', value)}
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
                        onChange={(value) => setFieldValue('promoter_id', value)}
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
                        onChange={(value) => setFieldValue('store_id', value)}
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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update
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

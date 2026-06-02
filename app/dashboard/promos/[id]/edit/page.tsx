'use client'

import { BusinessForm } from '@/components/dashboard/BusinessForm'
import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { toast } from '@/hooks/use-toast'
import { catchError } from '@/lib/utils'
import { useUpdatePromoMutation } from '@/store/promos'
import { useRouter } from 'next/navigation'
import { useContext } from '../layout'
import * as Yup from 'yup'

export default function EditPromoPage() {
  const router = useRouter()
  const { promo, fetchEntity } = useContext()
  const [updatePromo] = useUpdatePromoMutation()

  if (!promo) {
    return null
  }

  const today = new Date().toISOString().split('T')[0]

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    type: Yup.string().required('Promo type is required'),
    start_date: Yup.string().nullable(),
    end_date: Yup.string().nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      await updatePromo({ id: promo.uuid, data: values }).unwrap()
      toast({
        title: 'Success',
        description: 'Promo updated successfully',
      })
      fetchEntity()
      router.push(`/dashboard/promos/${promo.uuid}`)
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: 'title',
      label: 'Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter promo title',
    },
    {
      name: 'type',
      label: 'Promo Type',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter promo type',
    },
    {
      name: 'start_date',
      label: 'Start Date',
      type: 'date' as const,
      required: false,
      placeholder: 'Select start date',
      min: today,
    },
    {
      name: 'end_date',
      label: 'End Date',
      type: 'date' as const,
      required: false,
      placeholder: 'Select end date',
      min: today,
    },
  ]

  const initialValues = {
    title: promo.title || '',
    type: promo.type || '',
    start_date: promo.start_date || '',
    end_date: promo.end_date || '',
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Promo"
        description="Update promo details"
      />
      <BusinessForm
        title="Edit Promo"
        description="Update the details for this promo"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update Promo"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}

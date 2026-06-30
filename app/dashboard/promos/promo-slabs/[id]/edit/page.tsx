'use client'

import { BusinessForm } from '@/components/dashboard/BusinessForm'
import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { toast } from '@/hooks/use-toast'
import { catchError } from '@/lib/utils'
import { useUpdatePromoSlabMutation } from '@/store/promo-slabs'
import { useRouter } from 'next/navigation'
import { useContext } from '../layout'
import * as Yup from 'yup'

export default function EditPromoSlabPage() {
  const router = useRouter()
  const { promoSlab, fetchEntity } = useContext()
  const [updatePromoSlab] = useUpdatePromoSlabMutation()

  if (!promoSlab) {
    return null
  }

  const validationSchema = Yup.object({
    promo_id: Yup.string().required('Promo is required'),
    title: Yup.string().required('Title is required'),
    bundle: Yup.string().nullable(),
    reward: Yup.string().nullable(),
    value: Yup.number()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .nullable()
      .min(0, 'Value must be at least 0'),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      await updatePromoSlab({
        id: promoSlab.uuid,
        data: {
          ...values,
          value: values.value === '' ? null : Number(values.value),
        },
      }).unwrap()
      toast({
        title: 'Success',
        description: 'Promo slab updated successfully',
      })
      fetchEntity()
      router.push(`/dashboard/promos/promo-slabs/${promoSlab.uuid}`)
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: 'promo_id',
      label: 'Promo',
      type: 'selectWithFetch' as const,
      required: true,
      fetchUrl: '/promos',
      valueKey: 'uuid',
      labelKey: 'type',
      placeholder: 'Select promo',
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter slab title',
    },
    {
      name: 'bundle',
      label: 'Bundle',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Describe the bundle',
      rows: 4,
    },
    {
      name: 'reward',
      label: 'Reward',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Describe the reward',
      rows: 4,
    },
    {
      name: 'value',
      label: 'Value',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter value',
    },
  ]

  const initialValues = {
    promo_id: promoSlab.promo?.uuid || '',
    title: promoSlab.title || '',
    bundle: promoSlab.bundle || '',
    reward: promoSlab.reward || '',
    value:
      promoSlab.value !== null && promoSlab.value !== undefined
        ? String(promoSlab.value)
        : '',
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Promo Slab"
        description="Update promo slab details"
      />
      <BusinessForm
        title="Edit Promo Slab"
        description="Update the details for this promo slab"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update Promo Slab"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
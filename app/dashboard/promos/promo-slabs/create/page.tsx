'use client'

import { BusinessForm } from '@/components/dashboard/BusinessForm'
import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { toast } from '@/hooks/use-toast'
import { catchError } from '@/lib/utils'
import { useCreatePromoSlabMutation } from '@/store/promo-slabs'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import * as Yup from 'yup'

export default function CreatePromoSlabPage() {
  const router = useRouter()
  const [createPromoSlab, { isLoading }] = useCreatePromoSlabMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    promo_id: '',
    title: '',
    bundle: '',
    reward: '',
    value: '',
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

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createPromoSlab({
        ...values,
        value: values.value === '' ? null : Number(values.value),
      }).unwrap()
      toast({
        title: 'Success',
        description: 'Promo slab created successfully',
      })
      helpers.resetForm()
      router.push('/dashboard/promos/promo-slabs')
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

  return (
    <div>
      <ViewPageHeader
        title="Create Promo Slab"
        description="Add a new promo slab to the system"
      />
      <BusinessForm
        title="Create Promo Slab"
        description="Enter the details for the new promo slab"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Promo Slab"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
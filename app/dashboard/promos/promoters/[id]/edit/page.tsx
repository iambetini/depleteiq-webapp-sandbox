'use client'

import UserForm from '@/components/dashboard/UserForm'
import { toast } from '@/hooks/use-toast'
import { catchError } from '@/lib/utils'
import { useUpdatePromoterMutation } from '@/store/promoters'
import { useRouter } from 'next/navigation'
import { useContext } from '../layout'
import * as Yup from 'yup'

export default function EditPromoterPage() {
  const router = useRouter()
  const { promoter, fetchEntity } = useContext()
  const [updatePromoter] = useUpdatePromoterMutation()

  if (!promoter) {
    return null
  }

  const validationSchema = Yup.object({
    market_id: Yup.string().required('Market is required'),
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    tpe_user_id: Yup.string().nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      await updatePromoter({ id: promoter.uuid, data: values }).unwrap()
      toast({
        title: 'Success',
        description: 'Promoter updated successfully',
      })
      fetchEntity()
      router.push(`/dashboard/field-agents/promoters/${promoter.uuid}`)
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: 'market_id',
      label: 'Market',
      type: 'selectWithFetch' as const,
      required: true,
      fetchUrl: '/markets',
      valueKey: 'uuid',
      labelKey: 'name',
      placeholder: 'Select market',
    },
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter first name',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter last name',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
      placeholder: 'Enter email address',
    },
    {
      name: 'tpe_user_id',
      label: 'TPE Supervisor',
      type: 'selectWithFetch' as const,
      required: false,
      fetchUrl: '/tpes',
      valueKey: 'uuid',
      labelKey: 'uuid',
      labelFormatter: (user: any) => `${user.first_name} ${user.last_name} (${user.email})`,
      placeholder: 'Select TPE supervisor (optional)',
    },
  ]

  const initialValues = {
    market_id: promoter.market?.uuid || '',
    first_name: promoter.user?.first_name || '',
    last_name: promoter.user?.last_name || '',
    email: promoter.user?.email || '',
    tpe_user_id: promoter.tpe_user?.uuid || '',
  }

  return (
    <div>
      <UserForm
        title="Edit Promoter"
        description="Update the details for this promoter"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update Promoter"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}

'use client'

import { BusinessForm } from '@/components/dashboard/BusinessForm'
import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { toast } from '@/hooks/use-toast'
import { catchError } from '@/lib/utils'
import { useUpdateParticipantMutation } from '@/store/participants'
import { useRouter } from 'next/navigation'
import { useContext } from '../layout'
import * as Yup from 'yup'

export default function EditParticipantPage() {
  const router = useRouter()
  const { participant, fetchEntity } = useContext()
  const [updateParticipant] = useUpdateParticipantMutation()

  if (!participant) {
    return null
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    phone: Yup.string().nullable(),
    email: Yup.string().email('Invalid email').nullable(),
    phone_network: Yup.string().nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      await updateParticipant({ id: participant.uuid, data: values }).unwrap()
      toast({
        title: 'Success',
        description: 'Sign up updated successfully',
      })
      fetchEntity()
      router.push(`/dashboard/promos/participants/${participant.uuid}`)
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
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
      name: 'phone',
      label: 'Phone',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter phone number',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: false,
      placeholder: 'Enter email address',
    },
    {
      name: 'phone_network',
      label: 'Phone Network',
      type: 'text' as const,
      required: false,
      placeholder: 'Enter phone network',
    },
  ]

  const initialValues = {
    first_name: participant.first_name || '',
    last_name: participant.last_name || '',
    phone: participant.phone || '',
    email: participant.email || '',
    phone_network: participant.phone_network || '',
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Sign up"
        description="Update sign up details"
      />
      <BusinessForm
        title="Edit Sign up"
        description="Update the details for this sign up"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update Sign up"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}

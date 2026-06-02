'use client';

import { BusinessForm } from '@/components/dashboard/BusinessForm';
import ViewPageHeader from '@/components/dashboard/ViewPageHeader';
import { toast } from '@/hooks/use-toast';
import { catchError } from '@/lib/utils';
import { useCreatePromoMutation } from '@/store/promos';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import * as Yup from 'yup';

export default function CreatePromoPage() {
  const router = useRouter();
  const [createPromo, { isLoading }] = useCreatePromoMutation();
  const formRef = useRef<any>(null);

  const today = new Date().toISOString().split('T')[0];

  const initialValues = {
    title: '',
    type: '',
    start_date: '',
    end_date: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    type: Yup.string().required('Promo type is required'),
    start_date: Yup.string().nullable(),
    end_date: Yup.string().nullable(),
  });

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createPromo(values).unwrap();
      toast({
        title: 'Success',
        description: 'Promo created successfully',
      });
      helpers.resetForm();
      router.push('/dashboard/promos');
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false);
    }
  };

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
  ];

  return (
    <div>
      <ViewPageHeader
        title="Create Promo"
        description="Add a new promotional campaign to the system"
      />
      <BusinessForm
        title="Create Promo"
        description="Enter the details for the new promo"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create"
        onCancel={() => router.back()}
      />
    </div>
  );
}


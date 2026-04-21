'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import * as Yup from 'yup';
import type { IPromo } from '@/types/promo';

interface PromoFormProps {
  initialData?: IPromo;
  onSubmit: (data: Partial<IPromo>) => Promise<void>;
}

const validationSchema = Yup.object().shape({
  type: Yup.string().required('Promo type is required'),
  start_date: Yup.string().nullable(),
  end_date: Yup.string().nullable(),
});

export function PromoForm({ initialData, onSubmit }: PromoFormProps) {
  const router = useRouter();

  const initialValues = {
    type: initialData?.type || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
  };

  const handleSubmit = useCallback(
    async (values: typeof initialValues) => {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
    [onSubmit],
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, handleChange, errors, touched, isSubmitting }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Promo Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="type"
                name="type"
                type="text"
                value={values.type}
                onChange={handleChange}
                placeholder="Enter promo type"
                className={errors.type && touched.type ? 'border-red-500' : ''}
              />
              {errors.type && touched.type && (
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={values.start_date}
                onChange={handleChange}
                className={errors.start_date && touched.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && touched.start_date && (
                <ErrorMessage
                  name="start_date"
                  component="div"
                  className="text-red-500 text-sm"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={values.end_date}
                onChange={handleChange}
                className={errors.end_date && touched.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && touched.end_date && (
                <ErrorMessage name="end_date" component="div" className="text-red-500 text-sm" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Promo'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

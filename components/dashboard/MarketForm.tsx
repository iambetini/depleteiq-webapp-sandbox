"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, Form, Formik } from "formik";
import { Save } from "lucide-react";
import * as Yup from "yup";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithFetch } from "@/components/ui/select";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "selectWithFetch";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  fetchUrl?: string;
  valueKey?: string;
  labelKey?: string;
  onFocus?: () => void;
  rows?: number;
}

interface MarketFormProps {
  initialValues: Record<string, any>;
  validationSchema: Yup.ObjectSchema<any>;
  fields: FieldConfig[];
  isLoading: boolean;
  onSubmit: (values: any, helpers: any) => void;
  submitLabel: string;
  title: string;
  description: string;
  onCancel: () => void;
  onFieldUpdate?: (fieldName: string, value: any) => void;
}

export interface MarketFormRef {
  setFieldValue: (fieldName: string, value: any) => void;
}

export const MarketForm = forwardRef<MarketFormRef, MarketFormProps>(({
  initialValues,
  validationSchema,
  fields,
  isLoading,
  onSubmit,
  submitLabel,
  title,
  description,
  onCancel,
  onFieldUpdate,
}, ref) => {
  const setFieldValueRef = useRef<((field: string, value: any) => void) | null>(null)

  useImperativeHandle(ref, () => ({
    setFieldValue: (fieldName: string, value: any) => {
      if (setFieldValueRef.current) {
        setFieldValueRef.current(fieldName, value)
      }
    }
  }), [])
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ values, handleChange, setFieldValue, errors, touched, isSubmitting }) => {
            // Store the setFieldValue function for external access
            setFieldValueRef.current = setFieldValue
            
            return (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div className="space-y-2" key={field.name}>
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && " *"}
                    </Label>
                    {field.type === "text" ? (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={values[field.name]}
                        onChange={handleChange}
                        onFocus={field.onFocus}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={values[field.name]}
                        onChange={handleChange}
                        onFocus={field.onFocus}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                      />
                    ) : field.type === "selectWithFetch" ? (
                      <SelectWithFetch
                        fetchUrl={field.fetchUrl!}
                        value={values[field.name]}
                        onChange={uuid => setFieldValue(field.name, uuid)}
                        valueKey={field.valueKey}
                        labelKey={field.labelKey}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <select
                        id={field.name}
                        name={field.name}
                        value={values[field.name]}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">
                          {field.placeholder || `Select ${field.label}`}
                        </option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary" disabled={isLoading || isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading || isSubmitting ? submitLabel + "..." : submitLabel}
                </Button>
              </div>
            </Form>
            )
          }}
        </Formik>
      </CardContent>
    </Card>
  );
})

MarketForm.displayName = 'MarketForm'

export default MarketForm

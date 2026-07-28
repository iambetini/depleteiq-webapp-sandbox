"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectWithFetch,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ErrorMessage, Form, Formik } from "formik"
import { Save, Loader2 } from "lucide-react"
import { forwardRef, useImperativeHandle, useRef } from "react"
import * as Yup from "yup"

interface FieldOption {
  label: string
  value: string
}

interface FieldConfig {
  name: string
  label: string
  type: "text" | "textarea" | "email" | "date" | "select" | "selectWithFetch" | "switch"
  required?: boolean
  placeholder?: string
  rows?: number
  fetchUrl?: string
  valueKey?: string
  labelKey?: string
  labelFormatter?: (item: any) => string
  initialSearch?: string
  options?: FieldOption[]
  min?: string
  max?: string
  disabled?: boolean
  readOnly?: boolean
  onFocus?: () => void
  onCheckedChange?: (checked: boolean) => void
}

interface BusinessFormProps {
  initialValues: Record<string, any>
  validationSchema: Yup.ObjectSchema<any>
  fields: FieldConfig[]
  isLoading: boolean
  onSubmit: (values: any, helpers: any) => void
  submitLabel: string
  title: string
  description: string
  onCancel: () => void
  cardClassName?: string
}

export interface BusinessFormRef {
  setFieldValue: (fieldName: string, value: any) => void
}

export const BusinessForm = forwardRef<BusinessFormRef, BusinessFormProps>(
  (
    {
      initialValues,
      validationSchema,
      fields,
      isLoading,
      onSubmit,
      submitLabel,
      title,
      description,
      onCancel,
      cardClassName = "max-w-2xl",
    },
    ref
  ) => {
    const setFieldValueRef = useRef<((field: string, value: any) => void) | null>(null)

    useImperativeHandle(
      ref,
      () => ({
        setFieldValue: (fieldName: string, value: any) => {
          if (setFieldValueRef.current) {
            setFieldValueRef.current(fieldName, value)
          }
        },
      }),
      []
    )

    return (
      <Card className={cardClassName}>
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
              setFieldValueRef.current = setFieldValue

              return (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields
                      .filter((field) => field.type !== "switch")
                      .map((field) => (
                        <div className="space-y-2" key={field.name}>
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && " *"}
                          </Label>
                          {field.type === "selectWithFetch" ? (
                            <SelectWithFetch
                              fetchUrl={field.fetchUrl!}
                              value={values[field.name]}
                              onChange={(value) => setFieldValue(field.name, value)}
                              valueKey={field.valueKey}
                              labelKey={field.labelKey}
                              labelFormatter={field.labelFormatter}
                              initialSearch={field.initialSearch}
                              placeholder={field.placeholder}
                              disabled={field.disabled}
                            />
                          ) : field.type === "select" ? (
                            <Select
                              value={values[field.name] || undefined}
                              onValueChange={(value) => setFieldValue(field.name, value)}
                              disabled={field.disabled}
                            >
                              <SelectTrigger
                                className={
                                  errors[field.name] && touched[field.name] ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === "text" || field.type === "email" || field.type === "date" ? (
                            <Input
                              id={field.name}
                              name={field.name}
                              type={field.type}
                              value={values[field.name] || ""}
                              onChange={handleChange}
                              onFocus={field.onFocus}
                              placeholder={field.placeholder}
                              min={field.min}
                              max={field.max}
                              disabled={field.disabled}
                              readOnly={field.readOnly}
                              className={
                                errors[field.name] && touched[field.name] ? "border-red-500" : ""
                              }
                            />
                          ) : field.type === "textarea" ? (
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={values[field.name] || ""}
                              onChange={handleChange}
                              onFocus={field.onFocus}
                              placeholder={field.placeholder}
                              rows={field.rows || 3}
                              disabled={field.disabled}
                              readOnly={field.readOnly}
                              className={
                                errors[field.name] && touched[field.name] ? "border-red-500" : ""
                              }
                            />
                          ) : null}
                          {errors[field.name] && touched[field.name] && (
                            <ErrorMessage
                              name={field.name}
                              component="div"
                              className="text-red-500 text-sm"
                            />
                          )}
                        </div>
                      ))}
                  </div>

                  {fields
                    .filter((field) => field.type === "switch")
                    .map((field) => (
                      <div className="flex items-center space-x-2" key={field.name}>
                        <Switch
                          id={field.name}
                          checked={Boolean(values[field.name])}
                          onCheckedChange={(checked) => {
                            setFieldValue(field.name, checked)
                            field.onCheckedChange?.(checked)
                          }}
                          disabled={field.disabled || isLoading || isSubmitting}
                        />
                        <Label htmlFor={field.name}>{field.label}</Label>
                      </div>
                    ))}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
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
                          {submitLabel}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </CardContent>
      </Card>
    )
  }
)

BusinessForm.displayName = "BusinessForm"

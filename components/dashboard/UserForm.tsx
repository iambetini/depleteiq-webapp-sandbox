"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectWithFetch } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage, Form, Formik } from "formik";
import { Eye, EyeOff, Plus, Save } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "selectWithFetch"
  | "selectWithFetchAndCreate"
  | "switch"
  | "checkbox"
  | "custom"

interface FieldOption {
  label: string
  value: string
}

interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  fetchUrl?: string
  store?: string
  valueKey?: string
  labelKey?: string
  labelFormatter?: (item: any) => string
  initialSearch?: string
  selectedLabel?: string
  params?: Record<string, any>
  rows?: number
  colSpan?: number
  min?: number
  max?: number
  step?: number
  onCreateNew?: () => void
  createButtonText?: string
  onFocus?: () => void
  section?: string
  renderCustom?: (formik: any) => React.ReactNode
}

interface UserFormProps {
  title: string
  description: string
  initialValues: Record<string, any>
  validationSchema: any
  fields: FieldConfig[]
  isLoading: boolean
  onSubmit: (values: any, helpers: any) => Promise<void>
  submitLabel: string
  onCancel: () => void
  cardClassName?: string
  onFieldUpdate?: (fieldName: string, value: any) => void
}

export interface UserFormRef {
  setFieldValue: (fieldName: string, value: any) => void
}

function FormPasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
}: {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
        autoComplete="new-password"
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(({
  title,
  description,
  initialValues,
  validationSchema,
  fields,
  isLoading,
  onSubmit,
  submitLabel,
  onCancel,
  cardClassName,
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
    <Card className={cardClassName || "max-w-2xl"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, handleChange, setFieldValue, isSubmitting }) => {
            // Store the setFieldValue function for external access
            setFieldValueRef.current = setFieldValue

            return (
              <Form className="space-y-6">
                {(() => {
                  // Group fields by section
                  const sections: Record<string, typeof fields> = {}
                  const noSectionFields: typeof fields = []
                  
                  fields.forEach(field => {
                    if (field.section) {
                      if (!sections[field.section]) {
                        sections[field.section] = []
                      }
                      sections[field.section].push(field)
                    } else {
                      noSectionFields.push(field)
                    }
                  })
                  
                  // Render fields without section first
                  const allSections = [
                    { name: null, fields: noSectionFields },
                    ...Object.entries(sections).map(([name, sectionFields]) => ({ name, fields: sectionFields }))
                  ]
                  
                  return allSections.map(section => (
                    <div key={section.name || 'default'}>
                      {section.name && (
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">{section.name}</h3>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields
                          .filter(field => field.type !== "switch" && field.type !== "checkbox")
                          .map((field, idx) => {
                      if (field.type === "custom" && field.renderCustom) {
                        const colSpanClass = field.colSpan === 1 ? "md:col-span-1" : "md:col-span-2";
                        return (
                          <div className={colSpanClass} key={field.name}>
                            {field.renderCustom({ values, handleChange, setFieldValue, isSubmitting })}
                          </div>
                        )
                      }
                      if (field.type === "textarea") {
                        return (
                          <div className="space-y-2 md:col-span-2" key={field.name}>
                            <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={values[field.name]}
                              onChange={handleChange}
                              onFocus={field.onFocus}
                              placeholder={field.placeholder}
                              rows={field.rows || 3}
                            />
                            <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                          </div>
                        )
                      }
                      if (field.type === "select") {
                        return (
                          <div className="space-y-2" key={field.name}>
                            <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                            <Select
                              value={values[field.name] || undefined}
                              onValueChange={value => setFieldValue(field.name, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.filter(option => option.value).map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                          </div>
                        )
                      }
                      if (field.type === "selectWithFetch") {
                        return (
                          <div className="space-y-2" key={field.name}>
                            <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                            <SelectWithFetch
                              fetchUrl={field.fetchUrl}
                              store={field.store as any}
                              value={values[field.name]}
                              onChange={uuid => setFieldValue(field.name, uuid)}
                              valueKey={field.valueKey}
                              labelKey={field.labelKey}
                              labelFormatter={field.labelFormatter}
                              initialSearch={field.initialSearch}
                              selectedLabel={field.selectedLabel}
                              placeholder={field.placeholder}
                              params={field.params}
                            />
                            <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                          </div>
                        )
                      }
                      if (field.type === "selectWithFetchAndCreate") {
                        return (
                          <div className="space-y-2" key={field.name}>
                            <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <SelectWithFetch
                                  fetchUrl={field.fetchUrl}
                                  store={field.store as any}
                                  value={values[field.name]}
                                  onChange={uuid => setFieldValue(field.name, uuid)}
                                  valueKey={field.valueKey}
                                  labelKey={field.labelKey}
                                  labelFormatter={field.labelFormatter}
                                  initialSearch={field.initialSearch}
                                  selectedLabel={field.selectedLabel}
                                  placeholder={field.placeholder}
                                  params={field.params}
                                />
                              </div>
                              {field.onCreateNew && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={field.onCreateNew}
                                  className="px-3"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  {field.createButtonText || "Create"}
                                </Button>
                              )}
                            </div>
                            <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                          </div>
                        )
                      }
                      if (field.type === "password") {
                        return (
                          <div className="space-y-2" key={field.name}>
                            <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                            <FormPasswordInput
                              id={field.name}
                              name={field.name}
                              value={values[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                            />
                            <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                          </div>
                        )
                      }
                      // Default: text, email, number
                      return (
                        <div className="space-y-2" key={field.name}>
                          <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            value={values[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            min={field.type === "number" ? field.min : undefined}
                            max={field.type === "number" ? field.max : undefined}
                            step={field.type === "number" ? field.step : undefined}
                          />
                          <ErrorMessage name={field.name} component="p" className="text-sm text-red-500" />
                        </div>
                      )
                    })}
                      </div>
                    </div>
                  ))
                })()}
                {/* Render switch/checkbox fields on a separate row */}
                {fields
                  .filter(field => field.type === "switch" || field.type === "checkbox")
                  .map(field => {
                    if (field.type === "switch") {
                      return (
                        <div className="flex items-center space-x-2 mt-4" key={field.name}>
                          <Switch
                            id={field.name}
                            checked={values[field.name]}
                            onCheckedChange={checked => setFieldValue(field.name, checked)}
                          />
                          <Label htmlFor={field.name}>{field.label}</Label>
                        </div>
                      )
                    }
                    if (field.type === "checkbox") {
                      return (
                        <div className="flex items-center space-x-2 mt-4" key={field.name}>
                          <input
                            id={field.name}
                            name={field.name}
                            type="checkbox"
                            checked={values[field.name]}
                            onChange={handleChange}
                            className="h-4 w-4"
                            aria-label={field.label}
                          />
                          <Label htmlFor={field.name}>{field.label}</Label>
                        </div>
                      )
                    }
                    return null
                  })}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary" disabled={isLoading || isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading || isSubmitting ? "Creating..." : submitLabel}
                  </Button>
                </div>
              </Form>
            )
          }}
        </Formik>
      </CardContent>
    </Card>
  )
})

UserForm.displayName = 'UserForm'

export default UserForm

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useUpdateTargetMutation, useGetTargetQuery } from "@/store/targets"
import { useRouter, useParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import * as Yup from "yup"
import { catchError } from "@/lib/utils"
import { Calendar, Edit, Target as TargetIcon, User, Save, Banknote } from "lucide-react"
import { Form, Formik } from "formik"

interface TargetFormValues {
  type: string
  goal_type: string
  volume?: number
  amount?: number
  start_date?: string
  end_date?: string
}

export default function ManageTargetPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data, isLoading, refetch } = useGetTargetQuery(id)
  const target = (data as any)?.data || data
  const [updateTargetMutation] = useUpdateTargetMutation()
  const [isEditMode, setIsEditMode] = useState(false)

  const normalizeDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const initialValues = useMemo<TargetFormValues>(() => {
    if (!target) {
      return {
        type: "yearly_sales",
        goal_type: "amount",
        volume: 0,
        amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      }
    }

    return {
      type: target.type || "yearly_sales",
      goal_type: target.goal_type || "amount",
      volume: Number(target.volume || 0),
      amount: Number(target.amount || 0),
      start_date: normalizeDate(target.start_date),
      end_date: normalizeDate(target.end_date),
    }
  }, [target])

  const targetTypeOptions = useMemo(
    () => [
      { value: "sales", label: "Sales" },
      { value: "monthly_orders", label: "Monthly Orders" },
      { value: "quarterly_orders", label: "Quarterly Orders" },
      { value: "yearly_orders", label: "Yearly Orders" },
    ],
    []
  );

  const goalTypeOptions = useMemo(
    () => [
      { value: "amount", label: "Amount" },
      { value: "volume", label: "Volume" },
    ],
    []
  );

  const validationSchema = useMemo(() => Yup.object({
    type: Yup.string().required("Target type is required"),
    goal_type: Yup.string().oneOf(["amount", "volume"]).required("Goal type is required"),
    amount: Yup.number().when("goal_type", {
      is: "amount",
      then: (schema) => schema.min(0, "Must be a positive number").required("Amount is required"),
      otherwise: (schema) => schema.optional(),
    }),
    volume: Yup.number().when("goal_type", {
      is: "volume",
      then: (schema) => schema.min(0, "Must be a positive number").required("Volume is required"),
      otherwise: (schema) => schema.optional(),
    }),
    start_date: Yup.date().required("Start date is required"),
    end_date: Yup.date().required("End date is required").min(Yup.ref('start_date'), "End date must be after start date"),
  }), [])

  const handleSubmit = useCallback(async (values: TargetFormValues, { setSubmitting, setFieldError }: any) => {
    try {
      target && await updateTargetMutation({ id: target.uuid, data: values }).unwrap();
      toast({
        title: "Success",
        description: "Target updated successfully",
      });
      refetch();
      setIsEditMode(false);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [target, refetch, updateTargetMutation])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!target) {
    return <div>Target not found</div>
  }

  if (isEditMode) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#444444]">Edit Target</h2>
            <p className="text-[#ababab]">Update the target information below</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditMode(false)}
          >
            Cancel
          </Button>
        </div>

        <Card className="p-4">
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, handleChange, setFieldValue, errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Target Type</Label>
                        <Select
                          value={values.type}
                          onValueChange={(value) => setFieldValue("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                          <SelectContent>
                            {targetTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.type && touched.type && (
                          <p className="text-sm text-red-500">{errors.type}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal_type">Goal Type</Label>
                        <Select
                          value={values.goal_type}
                          onValueChange={(value) => setFieldValue("goal_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal type" />
                          </SelectTrigger>
                          <SelectContent>
                            {goalTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.goal_type && touched.goal_type && (
                          <p className="text-sm text-red-500">{errors.goal_type}</p>
                        )}
                      </div>

                      {values.goal_type === "amount" && (
                        <div className="space-y-2">
                          <Label htmlFor="amount">Target Amount (₦)</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            value={values.amount}
                            onChange={handleChange}
                            placeholder="Enter target amount"
                          />
                          {errors.amount && touched.amount && (
                            <p className="text-sm text-red-500">{errors.amount}</p>
                          )}
                        </div>
                      )}

                      {values.goal_type === "volume" && (
                        <div className="space-y-2">
                          <Label htmlFor="volume">Target Volume</Label>
                          <Input
                            id="volume"
                            name="volume"
                            type="number"
                            value={values.volume}
                            onChange={(e) => setFieldValue("volume", e.target.value === "" ? 0 : Number(e.target.value))}
                            placeholder="Enter target volume"
                          />
                          {errors.volume && touched.volume && (
                            <p className="text-sm text-red-500">{errors.volume}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={values.start_date}
                          onChange={handleChange}
                        />
                        {errors.start_date && touched.start_date && (
                          <p className="text-sm text-red-500">{errors.start_date}</p>
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
                        />
                        {errors.end_date && touched.end_date && (
                          <p className="text-sm text-red-500">{errors.end_date}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#eeeeee]">
                    <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="btn-primary">
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Updating..." : "Update Target"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#444444]">Manage Target</h2>
          <p className="text-[#ababab]">View and manage target information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Target Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#ababab]">Type</p>
                <Badge variant="outline" className="capitalize">
                  {target.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Goal Type</p>
                <Badge variant="secondary" className="capitalize">
                  {target.goal_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Amount</p>
                <p className="font-medium text-[#444444]">₦{Number(target.amount).toLocaleString()}</p>
              </div>
              {target.volume && (
                <div>
                  <p className="text-sm text-[#ababab]">Volume</p>
                  <p className="font-medium text-[#444444]">{Number(target.volume).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-[#ababab]">Date Range</p>
              <p className="font-medium text-[#444444]">
                {target.start_date || "N/A"} - {target.end_date || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-[#ababab]">Name</p>
                <p className="font-medium text-[#444444]">
                  {target.user?.first_name} {target.user?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#ababab]">Email</p>
                <p className="font-medium text-[#444444]">{target.user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#ababab]">Created</p>
                <p className="font-medium text-[#444444]">{target.created_at || "N/A"}</p>
              </div>
              {target.updated_at && (
                <div>
                  <p className="text-sm text-[#ababab]">Last Updated</p>
                  <p className="font-medium text-[#444444]">{target.updated_at}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

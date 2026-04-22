"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useCreateTargetMutation, useGetTargetsQuery, useUpdateTargetMutation } from "@/store/targets";
import { Target } from "@/types/target";
import { Form, Formik } from "formik";
import { Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import * as Yup from "yup";
import { useDistributorData } from "@/hooks/use-entity-data";


export default function DistributorTargetPage() {
  const { entity: distributor } = useDistributorData()
  const [createTarget] = useCreateTargetMutation();
  const [updateTarget] = useUpdateTargetMutation();
  const [createNewTarget, setCreateNewTarget] = useState(false);

  const userUuid = distributor?.user?.uuid || "";
  const { data: targetsData, isLoading: isTargetLoading } = useGetTargetsQuery({ type: "sales", ...(userUuid ? { user_id: userUuid } : {}), }, { skip: !userUuid });

  const targetList: any[] = Array.isArray(targetsData) ? targetsData : (targetsData as any)?.data?.items || [];
  const existingTarget: any | undefined = targetList[0];

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

  const handleSubmit = useCallback(
    async (
      values: Omit<Target, "id" | "uuid" | "created_at" | "updated_at">,
      helpers: { setSubmitting: (isSubmitting: boolean) => void; setFieldError: (field: string, message: string) => void; resetForm: () => void }
    ) => {
      const { setSubmitting, setFieldError, resetForm } = helpers;
      if (!distributor?.user?.uuid) {
        setFieldError("type", "Distributor information not available");
        setSubmitting(false);
        return;
      }
      try {
        // Prepare payload with mutually exclusive amount/volume based on goal_type
        const payload = {
          ...values,
          user_id: distributor.user.uuid,
          amount: values.goal_type === 'amount' ? values.amount : undefined,
          volume: values.goal_type === 'volume' ? values.volume : undefined,
        };

        // If checkbox is checked (create new) or no existing target, create new target
        if (createNewTarget || !existingTarget?.uuid) {
          await createTarget(payload).unwrap();
          toast({ title: "Success", description: "Target created successfully" });
          setCreateNewTarget(false); // Reset checkbox after creating
        } else {
          // Otherwise, update existing target
          await updateTarget({ id: existingTarget.uuid, data: payload }).unwrap();
          toast({ title: "Success", description: "Target updated successfully" });
        }
        resetForm();
      } catch (error: any) {
        catchError(error, setFieldError);
      } finally {
        setSubmitting(false);
      }
    },
    [distributor?.user?.uuid, createTarget, updateTarget, existingTarget?.uuid, createNewTarget]
  );

  const normalizeDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const getInitialValues = useCallback((): Omit<Target, 'id' | 'uuid' | 'created_at' | 'updated_at'> => {
    // If checkbox is checked (create new), return empty form
    if (createNewTarget) {
      return {
        user_id: distributor?.user?.uuid || '0',
        type: "yearly_sales",
        goal_type: "amount",
        amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      }
    }

    // If existing target and not creating new, populate with existing data
    if (existingTarget) {
      const goalType = existingTarget.goal_type || "amount";
      return {
        user_id: existingTarget.user_id || distributor?.user?.uuid || '0',
        type: existingTarget.type || "yearly_sales",
        goal_type: goalType,
        amount: goalType === 'amount' ? Number(existingTarget.amount || 0) : 0,
        volume: goalType === 'volume' ? Number(existingTarget.volume || 0) : 0,
        start_date: normalizeDate(existingTarget.start_date),
        end_date: normalizeDate(existingTarget.end_date),
      }
    }

    // No existing target, return empty form
    return {
      user_id: distributor?.user?.uuid || '0',
      type: "yearly_sales",
      goal_type: "amount",
      amount: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    }
  }, [existingTarget, distributor?.user?.uuid, createNewTarget])

  if (!distributor || !distributor.user) { return null; }

  if (isTargetLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const isEditMode = !!existingTarget?.uuid && !createNewTarget;

  return (
    <Card className="p-4">
      <CardContent>
        {existingTarget?.uuid && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="createNewTarget"
                checked={createNewTarget}
                onCheckedChange={(checked) => setCreateNewTarget(checked as boolean)}
              />
              <Label htmlFor="createNewTarget" className="text-sm font-medium cursor-pointer">
                Create a new target instead of updating the existing one
              </Label>
            </div>
          </div>
        )}

        <Formik
          initialValues={getInitialValues()}
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
                      onValueChange={(value) => {
                        setFieldValue("goal_type", value);
                        // Reset the opposite field when goal_type changes
                        if (value === 'amount') {
                          setFieldValue("volume", 0);
                        } else {
                          setFieldValue("amount", 0);
                        }
                      }}
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
                <Button type="submit" disabled={isSubmitting} className="btn-primary">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Target" : "Create Target")}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}

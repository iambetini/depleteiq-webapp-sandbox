"use client";

import { useMemo } from "react";
import SettingForm from "@/components/dashboard/SettingForm";
import { useSettingsPairs } from "@/hooks/useSettingsPairs";

export default function OrdersSettingsPage() {
  const allowModifyPairs = useMemo(() => (process.env.NEXT_PUBLIC_ALLOW_MODIFY_PAIRS ?? "false") === "true", []);
  const { initialValues, handleSave, handleDelete } = useSettingsPairs("order");

  return (
    <div className="space-y-6">
      <SettingForm
        title="Order Settings"
        parentKey="order"
        allowModifyPairs={allowModifyPairs}
        initialValues={initialValues}
        onSave={handleSave}
        onDelete={allowModifyPairs ? handleDelete : undefined}
      />
    </div>
  );
}
"use client"

import { redirect } from "next/navigation";

export default function ControlCentrePage() {
  redirect("/dashboard/general-settings/roles");
}


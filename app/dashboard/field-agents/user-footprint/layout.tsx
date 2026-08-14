"use client"

import React from "react"
import { ViewPageHeader } from "@/components/dashboard/ViewPageHeader"
import { DateFilter } from "@/components/dashboard/DateFilter"

export default function UserFootprintLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <ViewPageHeader title="User Footprint" description="View the recorded locations for this user" actions={<DateFilter />} />
            <div>{children}</div>
        </div>
    )
}

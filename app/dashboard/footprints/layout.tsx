"use client"

import React from "react"
import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { DateFilter } from "@/components/dashboard/DateFilter"

export default function FootprintsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <ListPageHeader
                title="Footprints"
                description="View recorded VSS locations"
            >
                <DateFilter />
            </ListPageHeader>
            <div>{children}</div>
        </div>
    )
}

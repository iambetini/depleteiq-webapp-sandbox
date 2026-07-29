'use client'

import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { useContext } from './layout'
import { PromoSlabSummary } from '@/types/promo-slab'

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '—'
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return String(value)

  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function PromoDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { promo } = useContext()

  if (!promo) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ''

  return (
    <div>
      <ViewPageHeader
        title={promo.title || 'Promo Details'}
        description="Promo Details"
        showEditButton={true}
        editHref={`/dashboard/promos/${promo.uuid}/edit`}
        showDeleteButton={['super-admin', 'admin', 'manager'].includes(userRole)}
        deleteOptions={{
          storeName: 'promos',
          uuid: promo.uuid,
        }}
      />

      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium text-lg text-[#444444]">
                {promo.title || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium text-lg capitalize text-[#444444]">
                {promo.type || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium text-[#444444]">
                {promo.start_date || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium text-[#444444]">
                {promo.end_date || '—'}
              </p>
            </div>

            {promo.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium text-[#444444] whitespace-pre-wrap">
                  {promo.description}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-[#444444]">
                {promo.created_at || '—'}
              </p>
            </div>

            {promo.updated_at && (
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium text-[#444444]">{promo.updated_at}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl mt-6">
        <CardHeader>
          <CardTitle className="text-[#444444]">Promo Slabs</CardTitle>
        </CardHeader>
        <CardContent>
          {promo.promo_slabs && promo.promo_slabs.length > 0 ? (
            <div className="space-y-4">
              {promo.promo_slabs.map((slab: PromoSlabSummary) => (
                <div
                  key={slab.uuid}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#444444]">{slab.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {slab.bundle || 'No bundle description provided'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="font-medium text-[#444444]">
                        {formatValue(slab.value)}
                      </p>
                    </div>
                  </div>

                  {slab.reward && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">Reward</p>
                      <p className="font-medium text-[#444444] whitespace-pre-wrap">
                        {slab.reward}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No promo slabs have been configured for this promo yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

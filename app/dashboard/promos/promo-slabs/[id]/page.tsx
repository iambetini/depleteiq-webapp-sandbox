'use client'

import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { useContext } from './layout'

export default function PromoSlabDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { promoSlab } = useContext()

  if (!promoSlab) {
    return null
  }

  const userRole = user?.role?.name?.toLowerCase() || ''
  const numericValue = Number(promoSlab.value)
  const formattedValue =
    promoSlab.value !== null &&
    promoSlab.value !== undefined &&
    promoSlab.value !== '' &&
    !Number.isNaN(numericValue)
      ? numericValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '—'

  return (
    <div>
      <ViewPageHeader
        title={promoSlab.title || 'Promo Slab Details'}
        description="Promo Slab Details"
        showEditButton={true}
        editHref={`/dashboard/promos/promo-slabs/${promoSlab.uuid}/edit`}
        showDeleteButton={['super-admin', 'admin', 'manager'].includes(userRole)}
        deleteOptions={{
          storeName: 'promoSlabs',
          uuid: promoSlab.uuid,
          redirectPath: '/dashboard/promos/promo-slabs',
        }}
      />

      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Promo</p>
              <p className="font-medium text-lg text-[#444444]">
                {promoSlab.promo?.title || promoSlab.promo?.type || '—'}
              </p>
              {promoSlab.promo?.title && promoSlab.promo?.type && (
                <p className="text-sm text-muted-foreground capitalize mt-0.5">
                  {promoSlab.promo.type}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium text-lg text-[#444444]">
                {promoSlab.title || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Bundle</p>
              <p className="font-medium text-[#444444] whitespace-pre-wrap">
                {promoSlab.bundle || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="font-medium text-[#444444] whitespace-pre-wrap">
                {promoSlab.reward || '—'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Value</p>
              <p className="font-medium text-[#444444]">{formattedValue}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-[#444444]">
                {promoSlab.created_at || '—'}
              </p>
            </div>

            {promoSlab.updated_at && (
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium text-[#444444]">
                  {promoSlab.updated_at}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
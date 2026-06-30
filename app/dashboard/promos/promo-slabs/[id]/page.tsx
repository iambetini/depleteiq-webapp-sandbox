'use client'

import ViewPageHeader from '@/components/dashboard/ViewPageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div>
      <ViewPageHeader
        title="Promo Slab Details"
        description="View detailed information about this promo slab"
        showEditButton={true}
        editHref={`/dashboard/promos/promo-slabs/${promoSlab.uuid}/edit`}
        showDeleteButton={['super-admin', 'admin', 'manager'].includes(userRole)}
        deleteOptions={{
          storeName: 'promoSlabs',
          uuid: promoSlab.uuid,
          redirectPath: '/dashboard/promos/promo-slabs',
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Information</CardTitle>
            <CardDescription>Promo slab details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Promo</label>
              <p className="text-base font-semibold">{promoSlab.promo?.type || 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-base font-semibold">{promoSlab.title}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Bundle</label>
              <p className="text-base font-semibold whitespace-pre-wrap">{promoSlab.bundle || 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Reward</label>
              <p className="text-base font-semibold whitespace-pre-wrap">{promoSlab.reward || 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Value</label>
              <p className="text-base font-semibold">{promoSlab.value ?? 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
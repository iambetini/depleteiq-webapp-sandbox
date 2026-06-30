'use client';

import ViewPageHeader from '@/components/dashboard/ViewPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useContext } from './layout';

export default function PromoDetailPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { promo } = useContext();

  if (!promo) {
    return null;
  }

  const userRole = user?.role?.name?.toLowerCase() || '';

  return (
    <div>
      <ViewPageHeader
        title="Promo Details"
        description="View detailed information about this promo"
        showEditButton={true}
        editHref={`/dashboard/promos/${promo.uuid}/edit`}
        showDeleteButton={['super-admin', 'admin', 'manager'].includes(userRole)}
        deleteOptions={{
          storeName: 'promos',
          uuid: promo.uuid,
        }}
      />
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Information</CardTitle>
            <CardDescription>Promo details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-base font-semibold">{promo.type}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-base font-semibold">{promo.title || 'N/A'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <p className="text-base font-semibold">
                {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <p className="text-base font-semibold">
                {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Promo Slabs</CardTitle>
            <CardDescription>Configured slab tiers for this promo</CardDescription>
          </CardHeader>
          <CardContent>
            {promo.promo_slabs && promo.promo_slabs.length > 0 ? (
              <div className="space-y-4">
                {promo.promo_slabs.map((slab) => (
                  <div key={slab.uuid} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-foreground">{slab.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {slab.bundle || 'No bundle description provided'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Value</p>
                        <p className="text-base font-semibold">{slab.value ?? 'N/A'}</p>
                      </div>
                    </div>

                    {slab.reward && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Reward</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{slab.reward}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No promo slabs have been configured for this promo yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


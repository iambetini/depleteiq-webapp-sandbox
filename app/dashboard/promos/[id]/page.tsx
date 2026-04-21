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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}


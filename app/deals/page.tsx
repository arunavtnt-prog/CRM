import { requireAuth } from '@/lib/auth/session';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DealsPage() {
  await requireAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">
            Manage deals and agreements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Deal management features will be available in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

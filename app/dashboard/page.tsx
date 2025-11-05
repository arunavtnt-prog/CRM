import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getDashboardData() {
  const [
    totalCreators,
    activeCreators,
    totalCampaigns,
    activeCampaigns,
    totalDeals,
    openDeals,
    recentActivities,
  ] = await Promise.all([
    prisma.creator.count(),
    prisma.creator.count({ where: { status: 'ACTIVE' } }),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.deal.count(),
    prisma.deal.count({ where: { status: { in: ['PENDING', 'NEGOTIATING'] } } }),
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return {
    stats: {
      totalCreators,
      activeCreators,
      totalCampaigns,
      activeCampaigns,
      totalDeals,
      openDeals,
    },
    recentActivities,
  };
}

export default async function DashboardPage() {
  await requireAuth();
  const data = await getDashboardData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Wavelaunch OS. Here's an overview of your operations.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Creators
              </CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalCreators}</div>
              <p className="text-xs text-muted-foreground">
                {data.stats.activeCreators} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Campaigns
              </CardTitle>
              <span className="text-2xl">📢</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {data.stats.totalCampaigns} total campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Deals
              </CardTitle>
              <span className="text-2xl">💼</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.openDeals}</div>
              <p className="text-xs text-muted-foreground">
                {data.stats.totalDeals} total deals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.user.name || activity.user.email}{' '}
                        <span className="text-muted-foreground font-normal">
                          {activity.action}
                        </span>{' '}
                        {activity.entity}
                      </p>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.entity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DashboardPage() {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </AppLayout>
    );
  }

  if (!analytics) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">
          Unable to load analytics data
        </div>
      </AppLayout>
    );
  }

  const { overview, topCreators, recentCampaigns, monthlyData, dealsByStatus } = analytics;

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalCreators}</div>
              <p className="text-xs text-muted-foreground">
                {overview.activeCreators} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <span className="text-2xl">📢</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {overview.totalCampaigns} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.closedDeals}</div>
              <p className="text-xs text-muted-foreground">
                {overview.totalDeals} total deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deal Value</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.totalDealValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(overview.closedDealValue)} closed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Deals Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Deals by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'value' ? formatCurrency(value) : value
                    }
                  />
                  <Legend />
                  <Bar dataKey="deals" fill="#8884d8" name="Number of Deals" />
                  <Bar dataKey="value" fill="#82ca9d" name="Deal Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Deal Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Deals by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dealsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {dealsByStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Creators and Recent Campaigns */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Creators */}
          <Card>
            <CardHeader>
              <CardTitle>Top Creators by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCreators.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No creator data yet</p>
                ) : (
                  topCreators.map((creator: any, index: number) => (
                    <div key={creator.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          #{index + 1} {creator.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {creator.dealCount} {creator.dealCount === 1 ? 'deal' : 'deals'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(creator.totalValue)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No campaigns yet</p>
                ) : (
                  recentCampaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-sm text-muted-foreground">{campaign.brand}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign._count.deals} deals
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

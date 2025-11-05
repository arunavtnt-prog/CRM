import { NextRequest, NextResponse } from 'next/server';
import { requireManageAPI } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/analytics - Get dashboard analytics
 * Returns aggregated data for dashboard visualizations
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireManageAPI();
    if (error) return error;

    // Get all data in parallel for performance
    const [
      totalCreators,
      activeCreators,
      totalCampaigns,
      activeCampaigns,
      totalDeals,
      closedDeals,
      allDeals,
      recentCampaigns,
      topCreators,
      dealsByMonth,
    ] = await Promise.all([
      // Creator stats
      prisma.creator.count(),
      prisma.creator.count({ where: { status: 'ACTIVE' } }),

      // Campaign stats
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),

      // Deal stats
      prisma.deal.count(),
      prisma.deal.count({ where: { status: { in: ['SIGNED', 'COMPLETED'] } } }),

      // All deals with values for aggregation
      prisma.deal.findMany({
        select: {
          value: true,
          status: true,
          createdAt: true,
          creator: {
            select: { id: true, name: true },
          },
        },
      }),

      // Recent campaigns
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          brand: true,
          status: true,
          budget: true,
          _count: { select: { deals: true } },
        },
      }),

      // Top creators by deal value
      prisma.deal.groupBy({
        by: ['creatorId'],
        _sum: { value: true },
        _count: { creatorId: true },
        orderBy: { _sum: { value: 'desc' } },
        take: 5,
      }),

      // Deals by month for chart
      prisma.deal.findMany({
        select: {
          createdAt: true,
          value: true,
          status: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Calculate total deal value
    const totalDealValue = allDeals.reduce((sum, deal) => sum + deal.value, 0);
    const closedDealValue = allDeals
      .filter(d => d.status === 'SIGNED' || d.status === 'COMPLETED')
      .reduce((sum, deal) => sum + deal.value, 0);

    // Get creator details for top creators
    const topCreatorIds = topCreators.map(tc => tc.creatorId);
    const creatorDetails = await prisma.creator.findMany({
      where: { id: { in: topCreatorIds } },
      select: { id: true, name: true, email: true },
    });

    const topCreatorsWithDetails = topCreators.map(tc => {
      const creator = creatorDetails.find(c => c.id === tc.creatorId);
      return {
        id: tc.creatorId,
        name: creator?.name || 'Unknown',
        email: creator?.email,
        totalValue: tc._sum.value || 0,
        dealCount: tc._count.creatorId,
      };
    });

    // Group deals by month for chart
    const monthlyData: { [key: string]: { count: number; value: number } } = {};
    dealsByMonth.forEach(deal => {
      const monthKey = new Date(deal.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, value: 0 };
      }
      monthlyData[monthKey].count++;
      monthlyData[monthKey].value += deal.value;
    });

    const monthlyChartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        deals: data.count,
        value: data.value,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    // Deal status distribution
    const dealsByStatus: { [key: string]: number } = {};
    allDeals.forEach(deal => {
      dealsByStatus[deal.status] = (dealsByStatus[deal.status] || 0) + 1;
    });

    const analytics = {
      overview: {
        totalCreators,
        activeCreators,
        totalCampaigns,
        activeCampaigns,
        totalDeals,
        closedDeals,
        totalDealValue,
        closedDealValue,
      },
      topCreators: topCreatorsWithDetails,
      recentCampaigns,
      monthlyData: monthlyChartData,
      dealsByStatus: Object.entries(dealsByStatus).map(([status, count]) => ({
        status,
        count,
      })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

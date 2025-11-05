import { NextRequest, NextResponse } from 'next/server';
import { requireManageAPI } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for campaign validation
const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  budget: z.number().positive().optional().or(z.string().transform((val) => parseFloat(val))),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
});

// GET /api/campaigns - List campaigns with search and filter
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireManageAPI();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const brand = searchParams.get('brand') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        deals: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { deals: true },
        },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireManageAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = campaignSchema.parse(body);

    // Convert string dates to Date objects
    const data: any = {
      ...validatedData,
    };

    if (validatedData.startDate) {
      data.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      data.endDate = new Date(validatedData.endDate);
    }

    const campaign = await prisma.campaign.create({
      data,
      include: {
        deals: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session!.id,
        action: 'created',
        entity: 'campaign',
        entityId: campaign.id,
        details: `Created campaign: ${campaign.title}`,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireManageAPI } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for deal validation
const dealSchema = z.object({
  campaignId: z.string().min(1, 'Campaign is required'),
  creatorId: z.string().min(1, 'Creator is required'),
  value: z.number().positive('Value must be positive').or(z.string().transform((val) => parseFloat(val))),
  status: z.enum(['PENDING', 'NEGOTIATING', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  signedAt: z.string().or(z.date()).optional().nullable(),
  notes: z.string().optional(),
});

// GET /api/deals - List deals with filters
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireManageAPI();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const campaignId = searchParams.get('campaignId') || '';
    const creatorId = searchParams.get('creatorId') || '';

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: { id: true, title: true, brand: true, status: true },
        },
        creator: {
          select: { id: true, name: true, email: true, status: true },
        },
      },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create new deal
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireManageAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = dealSchema.parse(body);

    // Convert string date to Date object
    const data: any = {
      ...validatedData,
    };

    if (validatedData.signedAt) {
      data.signedAt = new Date(validatedData.signedAt);
    }

    const deal = await prisma.deal.create({
      data,
      include: {
        campaign: {
          select: { id: true, title: true, brand: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session!.id,
        action: 'created',
        entity: 'deal',
        entityId: deal.id,
        details: `Created deal: ${deal.creator.name} x ${deal.campaign.title} ($${deal.value})`,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

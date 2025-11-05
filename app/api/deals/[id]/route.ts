import { NextRequest, NextResponse } from 'next/server';
import { requireManageAPI } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const dealSchema = z.object({
  campaignId: z.string().min(1, 'Campaign is required'),
  creatorId: z.string().min(1, 'Creator is required'),
  value: z.number().positive('Value must be positive').or(z.string().transform((val) => parseFloat(val))),
  status: z.enum(['PENDING', 'NEGOTIATING', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  signedAt: z.string().or(z.date()).optional().nullable(),
  notes: z.string().optional(),
});

// GET /api/deals/[id] - Get single deal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireManageAPI();
    if (error) return error;

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        campaign: true,
        creator: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

// PUT /api/deals/[id] - Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    } else if (validatedData.signedAt === null) {
      data.signedAt = null;
    }

    const deal = await prisma.deal.update({
      where: { id: params.id },
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
        action: 'updated',
        entity: 'deal',
        entityId: deal.id,
        details: `Updated deal: ${deal.creator.name} x ${deal.campaign.title}`,
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals/[id] - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireManageAPI();
    if (error) return error;

    await prisma.deal.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session!.id,
        action: 'deleted',
        entity: 'deal',
        entityId: params.id,
        details: `Deleted deal`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}

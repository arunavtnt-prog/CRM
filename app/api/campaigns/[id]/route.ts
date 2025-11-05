import { NextRequest, NextResponse } from 'next/server';
import { requireManageAPI } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  budget: z.number().positive().optional().or(z.string().transform((val) => val ? parseFloat(val) : undefined)),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
});

// GET /api/campaigns/[id] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireManageAPI();
    if (error) return error;

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        deals: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                instagramHandle: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data,
      include: {
        deals: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session!.id,
        action: 'updated',
        entity: 'campaign',
        entityId: campaign.id,
        details: `Updated campaign: ${campaign.title}`,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireManageAPI();
    if (error) return error;

    await prisma.campaign.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session!.id,
        action: 'deleted',
        entity: 'campaign',
        entityId: params.id,
        details: `Deleted campaign`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

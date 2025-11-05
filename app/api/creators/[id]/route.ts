import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const creatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  youtubeHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED']),
  notes: z.string().optional(),
});

// GET /api/creators/[id] - Get single creator
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { name: true, email: true },
        },
        deals: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator' },
      { status: 500 }
    );
  }
}

// PUT /api/creators/[id] - Update creator
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = creatorSchema.parse(body);

    const creator = await prisma.creator.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'updated',
        entity: 'creator',
        entityId: creator.id,
        details: `Updated creator: ${creator.name}`,
      },
    });

    return NextResponse.json(creator);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating creator:', error);
    return NextResponse.json(
      { error: 'Failed to update creator' },
      { status: 500 }
    );
  }
}

// DELETE /api/creators/[id] - Delete creator
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.creator.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'deleted',
        entity: 'creator',
        entityId: params.id,
        details: `Deleted creator`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting creator:', error);
    return NextResponse.json(
      { error: 'Failed to delete creator' },
      { status: 500 }
    );
  }
}

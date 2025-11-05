import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creator validation
const creatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  youtubeHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED']).default('ACTIVE'),
  notes: z.string().optional(),
});

// GET /api/creators - List creators with search and filter
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { instagramHandle: { contains: search, mode: 'insensitive' } },
        { tiktokHandle: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const creators = await prisma.creator.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { name: true, email: true },
        },
        deals: {
          select: { id: true, status: true },
        },
      },
    });

    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

// POST /api/creators - Create new creator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = creatorSchema.parse(body);

    const creator = await prisma.creator.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        ownerId: session.user.id,
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
        action: 'created',
        entity: 'creator',
        entityId: creator.id,
        details: `Created creator: ${creator.name}`,
      },
    });

    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating creator:', error);
    return NextResponse.json(
      { error: 'Failed to create creator' },
      { status: 500 }
    );
  }
}

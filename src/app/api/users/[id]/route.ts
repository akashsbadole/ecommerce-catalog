import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { Enquiry: true, BlogPost: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { name, email, role, isActive, password } = body;

    // Check user exists
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = name.trim();
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      // Check email uniqueness if changing
      if (trimmedEmail !== existing.email) {
        const emailExists = await db.user.findUnique({ where: { email: trimmedEmail } });
        if (emailExists) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }
      }
      data.email = trimmedEmail;
    }
    if (role !== undefined) {
      // Only allow admin or clerk roles
      const userRole = request.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json({ error: 'Only admins can change user roles' }, { status: 403 });
      }
      if (!['admin', 'clerk'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be admin or clerk' }, { status: 400 });
      }
      data.role = role;
    }
    if (isActive !== undefined) data.isActive = isActive;

    // Handle password change
    if (password !== undefined && password !== '') {
      const { hash } = await import('bcryptjs');
      data.password = await hash(password, 12);
    }

    const user = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    // Prevent self-deletion
    if (id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

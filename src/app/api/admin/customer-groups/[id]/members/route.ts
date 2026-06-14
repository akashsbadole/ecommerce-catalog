import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const group = await db.customerGroup.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { userId, companyId } = body;

    if (!userId && !companyId) {
      return NextResponse.json(
        { error: 'userId or companyId is required' },
        { status: 400 },
      );
    }

    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 },
        );
      }
    }

    if (companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId },
      });
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 },
        );
      }
    }

    const existing = await db.customerGroupMember.findFirst({
      where: {
        groupId: id,
        ...(userId ? { userId } : {}),
        ...(companyId ? { companyId } : {}),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Member already exists in this group' },
        { status: 400 },
      );
    }

    const member = await db.customerGroupMember.create({
      data: {
        groupId: id,
        userId: userId || null,
        companyId: companyId || null,
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { member, message: 'Member added successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Add customer group member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const group = await db.customerGroup.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');

    if (!userId && !companyId) {
      return NextResponse.json(
        { error: 'userId or companyId query param is required' },
        { status: 400 },
      );
    }

    const member = await db.customerGroupMember.findFirst({
      where: {
        groupId: id,
        ...(userId ? { userId } : {}),
        ...(companyId ? { companyId } : {}),
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 },
      );
    }

    await db.customerGroupMember.delete({ where: { id: member.id } });

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove customer group member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const menu = await db.menu.findUnique({
      where: { id },
      include: { children: { orderBy: { order: "asc" } } },
    });
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }
    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await db.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const body = await request.json();

    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.menu.findFirst({
        where: { slug: body.slug, NOT: { id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already in use" },
          { status: 409 },
        );
      }
    }

    const menu = await db.menu.update({
      where: { id },
      data: {
        ...(body.label !== undefined && { label: body.label }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.parentId !== undefined && { parentId: body.parentId || null }),
        ...(body.externalUrl !== undefined && {
          externalUrl: body.externalUrl || null,
        }),
        ...(body.page !== undefined && { page: body.page || null }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Update menu error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await db.menu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    await db.menu.delete({ where: { id } });
    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

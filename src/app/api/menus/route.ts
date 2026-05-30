import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { z } from "zod";

const menuSchema = z.object({
  label: z.string().min(1, "Label is required"),
  slug: z.string().min(1, "Slug is required"),
  parentId: z.string().nullable().optional(),
  externalUrl: z.string().nullable().optional(),
  page: z.string().nullable().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const menus = await db.menu.findMany({
      orderBy: [{ order: "asc" }, { label: "asc" }],
      include: {
        children: {
          orderBy: [{ order: "asc" }, { label: "asc" }],
        },
      },
    });
    return NextResponse.json({ menus });
  } catch (error) {
    console.error("Get menus error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = menuSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const data = result.data;

    const existing = await db.menu.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already in use" },
        { status: 409 },
      );
    }

    const menu = await db.menu.create({
      data: {
        label: data.label,
        slug: data.slug,
        parentId: data.parentId || null,
        externalUrl: data.externalUrl || null,
        page: data.page || null,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    const userId = request.headers.get("x-user-id") || undefined;
    const userName = request.headers.get("x-user-email") || undefined;
    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    logActivity({
      action: "menu.create",
      entity: "Menu",
      entityId: menu.id,
      userId,
      userName,
      ipAddress,
      details: { label: menu.label },
    }).catch(() => {});

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

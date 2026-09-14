import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGroups } from "@/lib/services/community-service";

export async function GET() {
  try {
    await requireUserId();
    const groups = await getGroups();
    return NextResponse.json({ groups });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    await requireUserId();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const existing = await db.communityGroup.findUnique({ where: { name: parsed.data.name } });
    if (existing) return NextResponse.json({ error: "A room with that name already exists" }, { status: 409 });

    const group = await db.communityGroup.create({
      data: { name: parsed.data.name, description: parsed.data.description },
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
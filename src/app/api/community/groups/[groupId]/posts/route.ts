import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ content: z.string().min(1).max(1000) });

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const post = await db.communityPost.create({
      data: { groupId: params.groupId, authorId: userId, content: parsed.data.content },
      include: { author: true, reactions: true },
    });

    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { toggleReaction } from "@/lib/services/community-service";

export async function POST(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const userId = await requireUserId();
    const result = await toggleReaction(params.postId, userId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { reportPost } from "@/lib/services/community-service";

export async function POST(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const userId = await requireUserId();
    await reportPost(params.postId, userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to report" }, { status: 500 });
  }
}
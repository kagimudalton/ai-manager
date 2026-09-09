import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { getGroupWithPosts } from "@/lib/services/community-service";

export async function GET(_request: Request, { params }: { params: { groupId: string } }) {
  try {
    const userId = await requireUserId();
    const group = await getGroupWithPosts(params.groupId, userId);
    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ group, currentUserId: userId });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to load group" }, { status: 500 });
  }
}
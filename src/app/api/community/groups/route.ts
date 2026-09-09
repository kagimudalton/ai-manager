import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
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
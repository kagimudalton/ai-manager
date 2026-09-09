import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { getOpportunitiesForUser } from "@/lib/services/opportunity-service";

export async function GET() {
  try {
    const userId = await requireUserId();
    const opportunities = await getOpportunitiesForUser(userId);
    return NextResponse.json({ opportunities });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to load opportunities" }, { status: 500 });
  }
}
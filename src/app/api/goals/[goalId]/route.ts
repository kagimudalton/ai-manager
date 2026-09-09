import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { getGoal } from "@/lib/services/goal-service";

export async function GET(_request: Request, { params }: { params: { goalId: string } }) {
  try {
    const userId = await requireUserId();
    const goal = await getGoal(params.goalId, userId);
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ goal });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to load goal" }, { status: 500 });
  }
}

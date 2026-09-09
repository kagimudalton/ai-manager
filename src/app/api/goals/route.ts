import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import * as goalRepo from "@/lib/repositories/goal-repository";
import { getUserGoals } from "@/lib/services/goal-service";

export async function GET() {
  try {
    const userId = await requireUserId();
    const goals = await getUserGoals(userId);
    return NextResponse.json({ goals });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
  }
}

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  objective: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const goal = await goalRepo.createGoal(userId, parsed.data.title, parsed.data.objective);
    return NextResponse.json({ goal }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

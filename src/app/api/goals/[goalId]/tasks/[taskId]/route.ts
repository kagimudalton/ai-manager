import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { toggleTask } from "@/lib/services/goal-service";

const patchSchema = z.object({ done: z.boolean() });

export async function PATCH(
  request: Request,
  { params }: { params: { goalId: string; taskId: string } }
) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const task = await toggleTask(params.taskId, userId, parsed.data.done);
    return NextResponse.json({ task });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

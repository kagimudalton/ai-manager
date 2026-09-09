import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { executeAction } from "@/lib/services/ai-manager-service";

const actionSchema = z.object({
  messageId: z.string(),
  actionType: z.enum(["openLesson", "openCareer", "openGoals", "openOpportunities", "completeTask"]),
});

// This endpoint exists specifically so an AI-proposed action never executes
// without a distinct, explicit client call — the "Confirm" tap in the UI is
// what invokes this, never the /api/ai/chat response itself.
export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await executeAction(userId, parsed.data.messageId, parsed.data.actionType);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to execute action" }, { status: 500 });
  }
}

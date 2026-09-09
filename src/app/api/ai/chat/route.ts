import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMessage } from "@/lib/services/ai-manager-service";

const sendSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let conversationId = parsed.data.conversationId;
    if (!conversationId) {
      const conversation = await db.aIConversation.create({ data: { userId } });
      conversationId = conversation.id;
    }

    const result = await sendMessage(userId, conversationId, parsed.data.message);
    return NextResponse.json({ conversationId, ...result });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    // Deliberately generic message to the client — the real error (e.g. a
    // missing ANTHROPIC_API_KEY) goes to the server log, not the browser.
    return NextResponse.json({ error: "The AI Manager is unavailable right now." }, { status: 502 });
  }
}

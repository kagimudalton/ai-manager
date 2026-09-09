import { db } from "@/lib/db";
import { buildChatContext } from "@/lib/ai/context-builder";
import { OllamaProvider } from "@/lib/ai/ollama-provider";
import { GeminiProvider } from "@/lib/ai/gemini-provider";
import { ClaudeProvider } from "@/lib/ai/claude-provider";
import type { LLMProvider, ChatTurn } from "@/lib/ai/provider";
import { completeNextTask } from "@/lib/services/goal-service";
import type { AIActionType } from "@/types";

function getProvider(): LLMProvider {
  const choice = (process.env.AI_PROVIDER ?? "ollama").toLowerCase();
  if (choice === "gemini") return new GeminiProvider();
  if (choice === "claude") return new ClaudeProvider();
  return new OllamaProvider();
}

const provider = getProvider();

function buildSystemPrompt(context: Awaited<ReturnType<typeof buildChatContext>>): string {
  const lines: string[] = [`User: ${context.userName}.`];

  if (context.career) {
    lines.push(`Dream career: ${context.career.targetCareer}. Career readiness: ${context.career.careerReadiness}%.`);
  }
  if (context.learning) {
    lines.push(`Current lesson: "${context.learning.lessonTitle}" (${context.learning.percentComplete}% done) in ${context.learning.subject}.`);
  }
  if (context.goal) {
    const remaining = context.goal.milestones.flatMap((m) => m.tasks).filter((t) => !t.done).length;
    lines.push(`Active goal: "${context.goal.title}" with ${remaining} tasks remaining.`);
  }
  lines.push(`Interests: ${context.interests.join(", ") || "none listed yet"}.`);

  return `You are the AI Manager inside a personal growth app - a warm, encouraging, concise coach for learning, career, and goals. You're talking to real people of all ages and backgrounds, not just students, so keep language plain and never condescending.

Ground every reply in the user's actual data below. Keep replies to 2-3 short sentences.

${lines.join("\n")}

You may optionally propose exactly one action for the app to offer as a confirmable button. Valid action types: "openLesson", "openCareer", "openGoals", "openOpportunities", "completeTask", or null if no action fits. Only propose actions tied to data mentioned above.

Respond with ONLY valid JSON, no other text, no markdown fences, in exactly this shape:
{"reply": "your natural-language reply", "actionLabel": "short button text or null", "actionType": "one of the types above or null"}`;
}

export async function sendMessage(userId: string, conversationId: string, userMessage: string) {
  const [context, history] = await Promise.all([
    buildChatContext(userId),
    db.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
  ]);

  const systemPrompt = buildSystemPrompt(context);
  const chatHistory: ChatTurn[] = history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  await db.aIMessage.create({
    data: { conversationId, role: "user", content: userMessage },
  });

  const result = await provider.generateManagerReply({ systemPrompt, history: chatHistory, userMessage });

  const assistantMessage = await db.aIMessage.create({
    data: {
      conversationId,
      role: "assistant",
      content: result.reply,
      actionType: result.actionType,
      actionLabel: result.actionLabel,
    },
  });

  return { message: assistantMessage, actionType: result.actionType, actionLabel: result.actionLabel };
}

export async function executeAction(userId: string, messageId: string, actionType: AIActionType) {
  const message = await db.aIMessage.findUnique({ where: { id: messageId } });
  if (!message || message.actionExecutedAt) {
    throw new Error("Action already executed or not found");
  }

  if (actionType === "completeTask") {
    const context = await buildChatContext(userId);
    if (context.goal) {
      await completeNextTask(userId, context.goal.id);
    }
  }

  await db.aIMessage.update({
    where: { id: messageId },
    data: { actionExecutedAt: new Date() },
  });
}
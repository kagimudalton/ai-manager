import type { LLMProvider, AIManagerReply, ChatTurn } from "@/lib/ai/provider";

const VALID_ACTIONS = new Set(["openLesson", "openCareer", "openGoals", "openOpportunities", "completeTask"]);

// Rewritten against Google's current docs (ai.google.dev/gemini-api/docs/api-key
// and /docs/migrate-to-interactions) as of this fix. Google replaced the old
// generateContent REST shape with a new "Interactions API", and new AI Studio
// keys (the "AQ." prefix) are auth-type keys that only work against this new
// endpoint, sent via the x-goog-api-key header, not a ?key= query param.
// Older models like gemini-2.5-flash are NOT supported here either.
export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey");
    }
    this.apiKey = key;
    this.model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
  }

  async generateManagerReply({
    systemPrompt,
    history,
    userMessage,
  }: {
    systemPrompt: string;
    history: ChatTurn[];
    userMessage: string;
  }): Promise<AIManagerReply> {
    const url = "https://generativelanguage.googleapis.com/v1beta/interactions";

    // Combining everything into one input string, since this app already
    // manages its own conversation history in Postgres rather than relying
    // on Google's server-side previous_interaction_id state.
    const historyText = history
      .map((m) => `${m.role === "assistant" ? "ASSISTANT" : "USER"}: ${m.content}`)
      .join("\n\n");

    const fullInput = `${systemPrompt}\n\n${historyText ? historyText + "\n\n" : ""}USER: ${userMessage}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        model: this.model,
        input: fullInput,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const modelStep = (data.steps as Array<{ type: string; content?: Array<{ type: string; text?: string }> }> | undefined)
      ?.find((s) => s.type === "model_output");
    const rawText = modelStep?.content?.find((c) => c.type === "text")?.text;
    if (!rawText) throw new Error("Gemini response contained no model_output text step");

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    let parsed: { reply?: string; actionType?: string | null; actionLabel?: string | null };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return { reply: cleaned, actionType: null, actionLabel: null };
    }

    const actionType = parsed.actionType && VALID_ACTIONS.has(parsed.actionType)
      ? (parsed.actionType as AIManagerReply["actionType"])
      : null;

    return {
      reply: parsed.reply ?? cleaned,
      actionType,
      actionLabel: actionType ? parsed.actionLabel ?? null : null,
    };
  }
}
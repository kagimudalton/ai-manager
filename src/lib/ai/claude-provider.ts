import type { LLMProvider, AIManagerReply, ChatTurn } from "@/lib/ai/provider";

const VALID_ACTIONS = new Set(["openLesson", "openCareer", "openGoals", "openOpportunities", "completeTask"]);

export class ClaudeProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      // Fail at construction time, not on first real user request — makes
      // a missing .env immediately obvious in local dev instead of a
      // confusing 500 the first time someone opens the AI Manager.
      throw new Error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add a real key.");
    }
    this.apiKey = key;
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 300,
        system: systemPrompt,
        messages: [...history, { role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Anthropic API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const textBlock = (data.content as Array<{ type: string; text?: string }> | undefined)?.find(
      (b) => b.type === "text"
    );
    if (!textBlock?.text) {
      throw new Error("Anthropic response contained no text block");
    }

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    let parsed: { reply?: string; actionType?: string | null; actionLabel?: string | null };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Model didn't return valid JSON — degrade gracefully to a plain
      // reply with no action rather than throwing and breaking the chat.
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

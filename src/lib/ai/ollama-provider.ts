import type { LLMProvider, AIManagerReply, ChatTurn } from "@/lib/ai/provider";

const VALID_ACTIONS = new Set(["openLesson", "openCareer", "openGoals", "openOpportunities", "completeTask"]);

// Free, local alternative to ClaudeProvider — talks to Ollama running on
// your own machine (https://ollama.com) instead of a paid API. Implements
// the exact same LLMProvider interface, which is the whole point of the
// provider-adapter pattern from the architecture doc: swapping this in
// requires changing one line in ai-manager-service.ts, nothing else.
export class OllamaProvider implements LLMProvider {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    this.model = process.env.OLLAMA_MODEL ?? "llama3.1";
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
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `Ollama request failed (${response.status}): ${errText}. Is "ollama serve" running and have you pulled the model with "ollama pull ${this.model}"?`
      );
    }

    const data = await response.json();
    const rawText: string | undefined = data?.message?.content;
    if (!rawText) throw new Error("Ollama response contained no message content");

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    let parsed: { reply?: string; actionType?: string | null; actionLabel?: string | null };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Local open-source models follow "reply only as JSON" instructions
      // less reliably than Claude does — degrade gracefully instead of
      // breaking the chat when that happens.
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

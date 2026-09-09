import type { AIActionType } from "@/types";

export type AIManagerReply = {
  reply: string;
  actionType: AIActionType;
  actionLabel: string | null;
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

// Every AI provider adapter implements this one method. Swapping providers
// (or A/B testing two of them) means writing a new file that satisfies this
// interface — nothing in the API route, services, or UI needs to change.
export interface LLMProvider {
  generateManagerReply(params: {
    systemPrompt: string;
    history: ChatTurn[];
    userMessage: string;
  }): Promise<AIManagerReply>;
}

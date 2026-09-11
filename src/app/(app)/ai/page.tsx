"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  actionType?: string | null;
  actionLabel?: string | null;
  executed?: boolean;
};

const ROUTE_BY_ACTION: Record<string, string> = {
  openLesson: "/learn",
  openCareer: "/career",
  openGoals: "/goals",
  openOpportunities: "/opportunities",
};

export default function AIManagerPage() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi â€” what should we focus on today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed }),
      });
      if (!res.ok) throw new Error("AI Manager request failed");
      const data = await res.json();
      setConversationId(data.conversationId);
      setMessages((m) => [
        ...m,
        {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
          actionType: data.actionType,
          actionLabel: data.actionLabel,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I'm having trouble responding right now â€” please try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function confirmAction(msg: Message, index: number) {
    if (!msg.id || !msg.actionType) return;

    // This POST is the Execution step. It only ever fires from this
    // explicit button handler â€” never automatically after the chat
    // response arrives above.
    try {
      const res = await fetch("/api/ai/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msg.id, actionType: msg.actionType }),
      });
      if (!res.ok) throw new Error("Failed to execute action");

      setMessages((m) => m.map((mm, i) => (i === index ? { ...mm, executed: true } : mm)));

      const route = ROUTE_BY_ACTION[msg.actionType];
      if (route) router.push(route);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Couldn't complete that action â€” please try again." }]);
    }
  }

  return (
    <main className="max-w-md sm:max-w-xl mx-auto flex flex-col px-4 sm:px-6 pt-2" style={{ height: "calc(100vh - 140px)" }}>
      <h1 className="text-lg font-semibold text-text mb-4">AI Manager</h1>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
              style={
                msg.role === "user"
                  ? { backgroundColor: "var(--accent)", color: "var(--ink-text)" }
                  : { backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }
              }
            >
              {msg.content}
            </div>
            {msg.role === "assistant" && msg.actionType && (
              <button
                onClick={() => confirmAction(msg, i)}
                disabled={msg.executed}
                className="mt-1.5 text-xs font-medium rounded-full px-3 py-1.5 border disabled:opacity-60"
                style={
                  msg.executed
                    ? { borderColor: "var(--teal)", color: "var(--teal)" }
                    : { borderColor: "var(--accent)", color: "var(--accent)" }
                }
              >
                {msg.executed ? "Done" : msg.actionLabel}
              </button>
            )}
          </div>
        ))}
        {sending && <p className="text-xs text-muted">AI Manager is thinking...</p>}
      </div>

      <div className="flex items-center gap-2 mt-4 border rounded-xl px-3 py-2.5" style={{ borderColor: "var(--border)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask your AI Manager..."
          className="flex-1 bg-transparent outline-none text-sm text-text"
        />
        <button onClick={() => send(input)} disabled={sending} className="text-sm font-medium text-accent disabled:opacity-40">
          Send
        </button>
      </div>
      <p className="text-xs text-muted text-center mt-2">Recommendations only â€” nothing executes without your confirmation.</p>
    </main>
  );
}

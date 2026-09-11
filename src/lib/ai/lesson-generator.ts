export async function generateLessonSteps(topic: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = `Create a genuinely useful beginner lesson about "${topic}" for a general audience - could be a total beginner of any age or background, not just a student or programmer. Make it specific and practical, not generic filler.

Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{"steps": [
  {"type": "concept", "body": "2-3 sentences introducing the core idea in plain language"},
  {"type": "explanation", "body": "3-4 sentences going deeper - the 'why' behind the concept, common misconceptions, or how it actually works"},
  {"type": "example", "body": "one concrete, specific, real-world example that makes the idea click"},
  {"type": "practice", "prompt": "a multiple choice question testing real understanding, not just recall", "options": ["option A", "option B", "option C"], "correctIndex": 0, "explanation": "why that answer is correct and why the others are wrong"}
]}`;

  const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ model: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview", input: prompt }),
  });
  if (!res.ok) throw new Error("Gemini request failed: " + res.status);

  const data = await res.json();
  const modelStep = (data.steps ?? []).find((s: any) => s.type === "model_output");
  const rawText = modelStep?.content?.find((c: any) => c.type === "text")?.text;
  if (!rawText) throw new Error("No content generated");

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.steps;
}
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function upsertSubject(name: string, category: string) {
  return db.learningSubject.upsert({
    where: { name },
    update: {},
    create: { name, category },
  });
}

async function addLessonIfMissing(subjectId: string, title: string, order: number, content: object) {
  const existing = await db.lesson.findFirst({ where: { subjectId, title } });
  if (existing) return existing;
  return db.lesson.create({ data: { subjectId, title, order, content } });
}

async function main() {
  const deepLearning = await upsertSubject("Deep Learning Fundamentals", "STEM");
  await addLessonIfMissing(deepLearning.id, "Gradient Descent & Learning Rates", 2, {
    steps: [
      { type: "concept", body: "Gradient descent is how a network decides which direction to adjust its weights - like walking downhill to find the lowest point of error." },
      { type: "explanation", body: "The learning rate controls step size. Too big and you overshoot the bottom; too small and training takes forever." },
      { type: "practice", prompt: "If training loss bounces around wildly instead of decreasing steadily, the learning rate is probably..." },
    ],
  });
  await addLessonIfMissing(deepLearning.id, "Optimizers Overview", 3, {
    steps: [
      { type: "concept", body: "Optimizers are algorithms that decide exactly how to use the gradient to update weights - plain gradient descent is the simplest one." },
      { type: "explanation", body: "Adam, one of the most common optimizers, adapts the learning rate per-parameter automatically, which is why it's a common default choice." },
    ],
  });

  const business = await upsertSubject("Business Fundamentals", "Business");
  await addLessonIfMissing(business.id, "Pricing Your First Product", 1, {
    steps: [
      { type: "concept", body: "Pricing isn't just cost plus margin - it's also a signal. Price too low and people may assume lower quality." },
      { type: "explanation", body: "A simple starting formula: (materials + your time at a fair hourly rate + overhead) x 1.5 to 2x for profit margin." },
      { type: "practice", prompt: "If a candle costs $4 in materials and takes 30 minutes of your time, what's a reasonable starting price?" },
    ],
  });
  await addLessonIfMissing(business.id, "Understanding Cash Flow", 2, {
    steps: [
      { type: "concept", body: "Cash flow is different from profit. You can be profitable on paper and still run out of cash if payments are slow." },
      { type: "explanation", body: "Track money in and out weekly, not just monthly - problems are much easier to catch early." },
    ],
  });

  const spanish = await upsertSubject("Conversational Spanish", "Language");
  await addLessonIfMissing(spanish.id, "Everyday Greetings", 1, {
    steps: [
      { type: "concept", body: "\"Hola\" works anytime, but \"Buenos dias/tardes/noches\" shows a bit more warmth and is very commonly used." },
      { type: "practice", prompt: "How would you greet someone at 8pm?" },
    ],
  });
  await addLessonIfMissing(spanish.id, "Ordering Food", 2, {
    steps: [
      { type: "concept", body: "\"Quisiera...\" (I would like...) is more polite than \"Quiero\" (I want) when ordering." },
      { type: "explanation", body: "\"La cuenta, por favor\" is how you ask for the bill almost anywhere in the Spanish-speaking world." },
    ],
  });

  console.log("Added extra subjects and lessons.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
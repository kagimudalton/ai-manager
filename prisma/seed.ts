import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await db.user.upsert({
    where: { email: "amara@example.com" },
    update: {},
    create: {
      email: "amara@example.com",
      passwordHash,
      name: "Amara",
      profile: {
        create: {
          interests: ["Machine Learning", "Painting", "Language learning"],
          learningLevel: "Intermediate",
        },
      },
      preferences: { create: {} },
      careerProfile: {
        create: {
          targetCareer: "Machine Learning Engineer",
          careerReadiness: 42,
        },
      },
    },
  });

  const skillNames = [
    { name: "Python", category: "Technical", proficiency: 80 },
    { name: "Linear Algebra", category: "Technical", proficiency: 45 },
    { name: "Deep Learning", category: "Technical", proficiency: 20 },
    { name: "Statistics", category: "Technical", proficiency: 55 },
  ];
  for (const s of skillNames) {
    const skill = await db.skill.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, category: s.category },
    });
    await db.userSkill.upsert({
      where: { userId_skillId: { userId: user.id, skillId: skill.id } },
      update: { proficiency: s.proficiency },
      create: {
        userId: user.id,
        skillId: skill.id,
        proficiency: s.proficiency,
      },
    });
  }

  const subject = await db.learningSubject.upsert({
    where: { name: "Deep Learning Fundamentals" },
    update: {},
    create: { name: "Deep Learning Fundamentals", category: "STEM" },
  });

  const lesson = await db.lesson.create({
    data: {
      subjectId: subject.id,
      title: "Backpropagation, Step by Step",
      order: 1,
      content: {
        steps: [
          {
            type: "concept",
            body: "Backpropagation is how a neural network learns from its mistakes.",
          },
          {
            type: "practice",
            prompt: "If error is large, adjustments should be...",
            options: ["Larger", "Smaller"],
            correct: 0,
          },
        ],
      },
    },
  });

  await db.learningProgress.create({
    data: { userId: user.id, lessonId: lesson.id, percentComplete: 60 },
  });

  const goal = await db.goal.create({
    data: {
      userId: user.id,
      title: "Finish Deep Learning path by Oct 1",
      objective:
        "Become interview-ready for Deep Learning roles by closing my three biggest skill gaps.",
      strategy: [
        "Close the gap on Linear Algebra first.",
        "One Deep Learning lesson per day.",
        "Ship one small project to prove the skill.",
      ],
    },
  });

  const milestone = await db.milestone.create({
    data: { goalId: goal.id, title: "Complete 5 core lessons", order: 1 },
  });

  const taskTitles = [
    { title: "What is a Neuron?", done: true },
    { title: "Forward Pass Basics", done: true },
    { title: "Backpropagation, Step by Step", done: true },
    { title: "Gradient Descent & Learning Rates", done: false },
    { title: "Optimizers Overview", done: false },
  ];
  for (const [i, t] of taskTitles.entries()) {
    await db.task.create({
      data: {
        milestoneId: milestone.id,
        title: t.title,
        done: t.done,
        order: i,
      },
    });
  }

  await db.opportunity.createMany({
    data: [
      {
        title: "Anthropic Applied AI Fellowship",
        org: "Anthropic",
        type: "fellowship",
        location: "Remote",
        eligibility:
          "Open to learners who've completed at least one Deep Learning module.",
        description: "A 6-week paid fellowship pairing you with a mentor.",
        sourceLabel: "Demo data — no live source connected",
      },
      {
        title: "Local Small Business Micro-Grant",
        org: "Community Development Fund",
        type: "grant",
        location: "Remote application",
        eligibility: "Open to first-time founders.",
        description: "Small grants plus a mentorship series for new founders.",
        sourceLabel: "Demo data — no live source connected",
      },
    ],
  });

  console.log("Seed complete:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

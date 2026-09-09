import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const amara = await db.user.findUniqueOrThrow({ where: { email: "amara@example.com" } });

  const groups = [
    { name: "AI/ML Builders", description: "For anyone learning or building with AI, from first steps to first job." },
    { name: "Weekend Painters", description: "Share what you're painting, get gentle feedback, no experience required." },
    { name: "Small Business Builders", description: "For entrepreneurs and side-hustlers trading real advice, not hype." },
  ];

  for (const g of groups) {
    const group = await db.communityGroup.upsert({
      where: { name: g.name },
      update: {},
      create: g,
    });

    const existingPosts = await db.communityPost.count({ where: { groupId: group.id } });
    if (existingPosts === 0) {
      await db.communityPost.create({
        data: {
          groupId: group.id,
          authorId: amara.id,
          content: `Excited to be part of ${g.name}! Looking forward to learning from everyone here.`,
        },
      });
    }
  }

  console.log("Community groups and posts seeded.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
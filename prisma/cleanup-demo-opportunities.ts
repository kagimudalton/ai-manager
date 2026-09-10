import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const result = await db.opportunity.deleteMany({
    where: { sourceLabel: { contains: "Demo data" } },
  });
  console.log(`Removed ${result.count} demo opportunities.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
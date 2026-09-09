import { db } from "@/lib/db";

export async function getOpportunitiesForUser(userId: string) {
  const [opportunities, saved] = await Promise.all([
    db.opportunity.findMany({ orderBy: { createdAt: "desc" } }),
    db.savedOpportunity.findMany({ where: { userId } }),
  ]);

  const savedMap = new Map(saved.map((s) => [s.opportunityId, s.status]));

  return opportunities
    .map((o) => ({
      ...o,
      status: savedMap.get(o.id) ?? null,
    }))
    .filter((o) => o.status !== "dismissed");
}

export async function setOpportunityStatus(userId: string, opportunityId: string, status: "saved" | "dismissed") {
  return db.savedOpportunity.upsert({
    where: { userId_opportunityId: { userId, opportunityId } },
    update: { status },
    create: { userId, opportunityId, status },
  });
}
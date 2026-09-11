import { db } from "@/lib/db";

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  location: string;
  url: string;
  job_types: string[];
  remote: boolean;
};

async function refreshLiveOpportunities() {
  const liveCount = await db.opportunity.count({ where: { sourceLabel: "Arbeitnow (live listings)" } });
  if (liveCount >= 15) return;

  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", { next: { revalidate: 3600 } });
    if (!res.ok) return;
    const data = await res.json();
    const jobs: ArbeitnowJob[] = (data.data ?? []).slice(0, 15);

    for (const job of jobs) {
      const existing = await db.opportunity.findFirst({ where: { sourceUrl: job.url } });
      if (existing) continue;

      const plainDescription = job.description.replace(/<[^>]*>/g, "").slice(0, 400);

      await db.opportunity.create({
        data: {
          title: job.title,
          org: job.company_name,
          type: "job",
          location: job.remote ? "Remote" : job.location,
          description: plainDescription,
          eligibility: job.job_types?.join(", ") || null,
          sourceLabel: "Arbeitnow (live listings)",
          sourceUrl: job.url,
        },
      });
    }
  } catch (err) {
    console.error("Failed to refresh live opportunities:", err);
  }
}

function relevanceScore(title: string, description: string | null, interests: string[]): number {
  if (interests.length === 0) return 1;
  const haystack = (title + " " + (description ?? "")).toLowerCase();
  const hit = interests.some((i) => haystack.includes(i.toLowerCase()));
  return hit ? 0 : 1;
}

export async function getOpportunitiesForUser(userId: string) {
  await refreshLiveOpportunities();

  const [opportunities, saved, profile] = await Promise.all([
    db.opportunity.findMany({ orderBy: { createdAt: "desc" } }),
    db.savedOpportunity.findMany({ where: { userId } }),
    db.userProfile.findUnique({ where: { userId } }),
  ]);

  const savedMap = new Map(saved.map((s) => [s.opportunityId, s.status]));
  const interests = profile?.interests ?? [];

  return opportunities
    .map((o) => ({ ...o, status: savedMap.get(o.id) ?? null }))
    .filter((o) => o.status !== "dismissed")
    .sort((a, b) => relevanceScore(a.title, a.description, interests) - relevanceScore(b.title, b.description, interests));
}

export async function setOpportunityStatus(userId: string, opportunityId: string, status: "saved" | "dismissed") {
  return db.savedOpportunity.upsert({
    where: { userId_opportunityId: { userId, opportunityId } },
    update: { status },
    create: { userId, opportunityId, status },
  });
}
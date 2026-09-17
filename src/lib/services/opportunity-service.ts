import { db } from "@/lib/db";

type ArbeitnowJob = {
  company_name: string; title: string; description: string;
  location: string; url: string; job_types: string[]; remote: boolean;
};
type RemotiveJob = {
  id: number; company_name: string; title: string; description: string;
  candidate_required_location: string; url: string; job_type: string;
};

async function refreshArbeitnow() {
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", { next: { revalidate: 3600 } });
    if (!res.ok) return;
    const data = await res.json();
    const jobs: ArbeitnowJob[] = (data.data ?? []).slice(0, 10);
    for (const job of jobs) {
      const existing = await db.opportunity.findFirst({ where: { sourceUrl: job.url } });
      if (existing) continue;
      await db.opportunity.create({
        data: {
          title: job.title, org: job.company_name, type: "job",
          location: job.remote ? "Remote - Worldwide" : job.location,
          description: job.description.replace(/<[^>]*>/g, "").slice(0, 400),
          eligibility: job.job_types?.join(", ") || null,
          sourceLabel: "Arbeitnow (live listings)", sourceUrl: job.url,
        },
      });
    }
  } catch (err) {
    console.error("Arbeitnow refresh failed:", err);
  }
}

async function refreshRemotive() {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=15", { next: { revalidate: 3600 } });
    if (!res.ok) return;
    const data = await res.json();
    const jobs: RemotiveJob[] = (data.jobs ?? []).slice(0, 15);
    for (const job of jobs) {
      const existing = await db.opportunity.findFirst({ where: { sourceUrl: job.url } });
      if (existing) continue;
      // Only keep listings genuinely open worldwide, or explicitly open to Africa -
      // this is the fix for location-locked postings excluding people outside
      // the US/EU.
      const loc = (job.candidate_required_location || "").toLowerCase();
      const isOpen = loc.includes("worldwide") || loc.includes("anywhere") || loc.includes("global") || loc.includes("africa") || loc === "";
      if (!isOpen) continue;

      await db.opportunity.create({
        data: {
          title: job.title, org: job.company_name, type: "job",
          location: job.candidate_required_location || "Remote - Worldwide",
          description: job.description.replace(/<[^>]*>/g, "").slice(0, 400),
          eligibility: job.job_type || null,
          sourceLabel: "Remotive (live listings, open worldwide)", sourceUrl: job.url,
        },
      });
    }
  } catch (err) {
    console.error("Remotive refresh failed:", err);
  }
}

async function refreshLiveOpportunities() {
  const liveCount = await db.opportunity.count({ where: { sourceLabel: { contains: "live listings" } } });
  if (liveCount >= 20) return;
  await Promise.all([refreshArbeitnow(), refreshRemotive()]);
}

function relevanceScore(title: string, description: string | null, interests: string[]): number {
  if (interests.length === 0) return 1;
  const haystack = (title + " " + (description ?? "")).toLowerCase();
  return interests.some((i) => haystack.includes(i.toLowerCase())) ? 0 : 1;
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
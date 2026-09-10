import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userId = await requireUserId();
    const [careerProfile, skills] = await Promise.all([
      db.careerProfile.findUnique({ where: { userId } }),
      db.userSkill.findMany({ where: { userId }, include: { skill: true }, orderBy: { proficiency: "asc" } }),
    ]);
    return NextResponse.json({ careerProfile, skills });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to load career" }, { status: 500 });
  }
}
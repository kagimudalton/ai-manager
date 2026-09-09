import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { setOpportunityStatus } from "@/lib/services/opportunity-service";

const bodySchema = z.object({ status: z.enum(["saved", "dismissed"]) });

export async function POST(request: Request, { params }: { params: { opportunityId: string } }) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await setOpportunityStatus(userId, params.opportunityId, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}
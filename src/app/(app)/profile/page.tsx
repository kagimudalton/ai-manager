import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/ui/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/onboarding");

  const [user, profile] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    db.userProfile.findUnique({ where: { userId } }),
  ]);

  return (
    <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-4">
      <h1 className="text-2xl font-bold text-text mb-2">Profile</h1>

      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
          >
            {user.name[0]}
          </div>
          <div>
            <p className="font-semibold text-text">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Interests</p>
        <div className="flex flex-wrap gap-2">
          {(profile?.interests ?? []).map((i) => (
            <span key={i} className="text-xs font-medium rounded-full px-3 py-1 border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              {i}
            </span>
          ))}
        </div>
      </Card>

      <SignOutButton />
    </main>
  );
}

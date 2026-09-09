import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
import { AmbientBackground } from "@/components/ui/ambient-background";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/onboarding");

  return (
    <div className="min-h-screen pb-20">
      <AmbientBackground />
      <div className="flex items-center justify-end max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <ThemeToggle />
      </div>
      {children}
      <BottomNav />
    </div>
  );
}
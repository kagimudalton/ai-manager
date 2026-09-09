"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, BookOpen, Compass, Users, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/ai", label: "AI", icon: Sparkles },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/opportunities", label: "Opps", icon: Compass },
  { href: "/community", label: "People", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t backdrop-blur z-10"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1 transition-transform active:scale-90">
              <Icon size={19} style={{ color: active ? "var(--accent)" : "var(--muted)" }} />
              <span className="text-[10px] font-mono" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
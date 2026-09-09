"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/onboarding" })}
      className="w-full text-sm font-medium rounded-xl py-2.5 border"
      style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
    >
      Sign out
    </button>
  );
}

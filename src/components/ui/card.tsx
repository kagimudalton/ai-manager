import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border bg-surface p-4 sm:p-5 transition-all duration-200",
        "border-border",
        className
      )}
      {...props}
    />
  );
}

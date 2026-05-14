import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  neutral: "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted-foreground)]",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rare: "border-sky-200 bg-sky-50 text-sky-800",
  epic: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  legendary: "border-amber-300 bg-amber-100 text-amber-900",
};

export function Badge({
  children,
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-strong)]",
  secondary:
    "border-transparent bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--surface-raised)]",
  outline:
    "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]",
  ghost:
    "border-transparent bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
  danger:
    "border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "size-10 p-0",
};

export function Button({
  asChild,
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}

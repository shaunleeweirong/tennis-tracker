import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <section
      className={[
        "rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={["flex flex-col gap-1.5 p-5", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h2 className={["text-base font-semibold text-[var(--foreground)]", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p className={["text-sm text-[var(--muted-foreground)]", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={["p-5 pt-0", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

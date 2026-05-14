import { Trophy } from "lucide-react";

const rarityClasses = {
  default: "border-slate-300 bg-slate-50",
  common: "border-emerald-300 bg-emerald-50",
  rare: "border-sky-300 bg-sky-50",
  epic: "border-fuchsia-300 bg-fuchsia-50",
  legendary: "border-amber-300 bg-amber-50",
};

export function PixelAvatar({
  name = "Rookie",
  rarity = "default",
  size = "md",
}: {
  name?: string;
  rarity?: keyof typeof rarityClasses;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "size-12 text-sm",
    md: "size-16 text-base",
    lg: "size-32 text-3xl",
    xl: "size-48 text-5xl",
  }[size];

  return (
    <div
      aria-label={`${name} character`}
      className={[
        "pixel-art grid shrink-0 place-items-center border-4 shadow-sm",
        sizeClass,
        rarityClasses[rarity],
      ].join(" ")}
      title={name}
    >
      <Trophy className="size-1/2 text-[var(--accent)]" />
    </div>
  );
}

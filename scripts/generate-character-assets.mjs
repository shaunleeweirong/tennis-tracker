import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const characters = [
  ["rookie", "#94a3b8"],
  ["baseline-buddy", "#34d399"],
  ["topspin-tinkerer", "#34d399"],
  ["slice-scout", "#34d399"],
  ["serve-apprentice", "#34d399"],
  ["return-ranger", "#34d399"],
  ["volley-spark", "#34d399"],
  ["footwork-flash", "#34d399"],
  ["focus-friend", "#34d399"],
  ["pattern-planner", "#34d399"],
  ["drop-shot-dreamer", "#34d399"],
  ["lob-lifter", "#34d399"],
  ["clutch-finisher", "#38bdf8"],
  ["streak-sprinter", "#38bdf8"],
  ["eight-point-ace", "#38bdf8"],
  ["self-believer", "#38bdf8"],
  ["match-winner", "#38bdf8"],
  ["calendar-crusher", "#38bdf8"],
  ["spin-savant", "#e879f9"],
  ["net-commander", "#e879f9"],
  ["tiebreak-tactician", "#e879f9"],
  ["tempo-captain", "#e879f9"],
  ["grand-slam-guardian", "#facc15"],
  ["court-legend", "#facc15"],
];

await mkdir("public/characters", { recursive: true });

await Promise.all(
  characters.map(async ([id, accent], index) => {
    const shirt = index % 2 === 0 ? "#15803d" : "#2563eb";
    const hair = ["#2f241d", "#7c2d12", "#111827", "#a16207"][index % 4];
    const skin = ["#f2c7a1", "#c68642", "#8d5524", "#f5d0b5"][index % 4];
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" shape-rendering="crispEdges">
        <rect width="128" height="128" fill="none"/>
        <rect x="30" y="18" width="68" height="80" fill="${accent}" opacity="0.18"/>
        <rect x="40" y="20" width="48" height="12" fill="${hair}"/>
        <rect x="36" y="32" width="56" height="36" fill="${skin}"/>
        <rect x="48" y="44" width="8" height="8" fill="#17211d"/>
        <rect x="72" y="44" width="8" height="8" fill="#17211d"/>
        <rect x="56" y="58" width="16" height="4" fill="#7f1d1d"/>
        <rect x="38" y="68" width="52" height="34" fill="${shirt}"/>
        <rect x="28" y="72" width="10" height="26" fill="${skin}"/>
        <rect x="90" y="72" width="10" height="26" fill="${skin}"/>
        <rect x="47" y="102" width="12" height="18" fill="#1f2937"/>
        <rect x="69" y="102" width="12" height="18" fill="#1f2937"/>
        <rect x="33" y="118" width="28" height="6" fill="#17211d"/>
        <rect x="67" y="118" width="28" height="6" fill="#17211d"/>
        <rect x="96" y="28" width="8" height="70" fill="#6b7280"/>
        <rect x="94" y="22" width="20" height="20" fill="none" stroke="#6b7280" stroke-width="4"/>
        <rect x="101" y="29" width="6" height="6" fill="${accent}"/>
        <rect x="16" y="18" width="14" height="14" fill="#d7f044"/>
        <rect x="18" y="20" width="10" height="10" fill="#d7f044"/>
      </svg>`;

    await sharp(Buffer.from(svg)).png().toFile(`public/characters/${id}.png`);
  }),
);

console.log(`Generated ${characters.length} character PNG assets.`);

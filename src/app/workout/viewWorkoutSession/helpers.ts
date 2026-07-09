// Exact port of mobile's ResultsScreen.tsx MUSCLE_LABEL_MAP — several keys
// need slashes ("MID/LOW BACK") or a typo correction ("abuductorsHips" ->
// "ABDUCTORS/HIPS") that a generic camelCase-split can't produce, and
// "chest" is explicitly mapped to "ADDUCTORS" (a backend key-collision
// workaround per mobile's own comment, not a mistake to fix here).
export const MUSCLE_LABEL_MAP: Record<string, string> = {
  chest: "ADDUCTORS",
  midLowBack: "MID/LOW BACK",
  lateralDelts: "LATERAL DELTS",
  rearDelts: "REAR DELTS",
  traps: "TRAPS",
  forearms: "FOREARMS",
  calves: "CALVES",
  hamstrings: "HAMSTRINGS",
  abuductorsHips: "ABDUCTORS/HIPS",
  quads: "QUADS",
  vmo: "VMO",
  neck: "NECK",
  oblique: "OBLIQUE",
  scaps: "SCAPS",
  adductors: "ADDUCTORS",
  latsUpperBack: "LATS/UPPER BACK",
  frontDelts: "FRONT DELTS",
  glutes: "GLUTES",
  abdominals: "ABDOMINALS",
  biceps: "BICEPS",
  triceps: "TRICEPS",
};

export function getSectionColor(label: string, index: number): string {
  const l = (label || "").toLowerCase();
  if (l.includes("warm") || l.includes("pre")) return "#F97316";
  if (l.includes("round 1")) return "#8B5CF6";
  if (l.includes("round 2")) return "#3B82F6";
  if (l.includes("round 3")) return "#10B981";
  const colors = ["#F97316", "#8B5CF6", "#3B82F6", "#10B981", "#EC4899"];
  return colors[index % colors.length];
}

export function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url
      .replace("wix:image://v1/", "")
      .split("#")[0]
      .split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

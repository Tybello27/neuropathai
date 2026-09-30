import { cn } from "@/lib/utils";

const palette = [
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function InitialsAvatar({
  name,
  size = 36,
  riskLevel,
  className,
}: {
  name?: string | null;
  size?: number;
  riskLevel?: "high" | "medium" | "low" | null;
  className?: string;
}) {
  const safe = (name ?? "?").trim() || "?";
  const initials = safe
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "?";

  const riskGradient =
    riskLevel === "high"
      ? "bg-gradient-danger"
      : riskLevel === "medium"
      ? "bg-gradient-warning"
      : riskLevel === "low"
      ? "bg-gradient-success"
      : `bg-gradient-to-br ${palette[hash(safe) % palette.length]}`;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white shrink-0 shadow-md",
        riskGradient,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

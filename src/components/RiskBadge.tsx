import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types/database";

const riskStyles: Record<RiskLevel, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/40 shadow-[0_0_12px_hsl(351_100%_62%/0.25)]",
  medium: "bg-warning/15 text-warning border-warning/40",
  low: "bg-success/15 text-success border-success/40",
};

const isRiskLevel = (value: string | null | undefined): value is RiskLevel =>
  value === "high" || value === "medium" || value === "low";

export function scoreToLevel(score: number | null | undefined): RiskLevel | null {
  if (score === null || score === undefined || isNaN(Number(score))) return null;
  const s = Number(score);
  if (s >= 0.7) return "high";
  if (s >= 0.4) return "medium";
  return "low";
}

export function RiskBadge({
  level,
  score,
}: {
  level?: string | null;
  score?: number | null;
}) {
  const safeLevel: RiskLevel | null =
    score !== undefined && score !== null
      ? scoreToLevel(score)
      : isRiskLevel(level)
      ? level
      : null;

  return (
    <Badge
      variant="outline"
      className={
        safeLevel
          ? `${riskStyles[safeLevel]} font-semibold uppercase text-[10px] tracking-wider`
          : "bg-muted/40 text-muted-foreground border-border"
      }
    >
      {safeLevel ?? "N/A"}
    </Badge>
  );
}

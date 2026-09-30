import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/RiskBadge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { usePatients } from "@/hooks/usePatients";
import { Search, Phone, MapPin, Activity, Eye, MessageCircle, Users } from "lucide-react";
import { cleanText, formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";

type Filter = "all" | "high" | "medium" | "low";

function RiskGauge({ score }: { score: number | null | undefined }) {
  const v = Math.max(0, Math.min(1, Number(score) || 0));
  const color = v >= 0.7 ? "hsl(351 100% 62%)" : v >= 0.4 ? "hsl(41 100% 50%)" : "hsl(145 100% 45%)";
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  return (
    <div className="relative h-16 w-16">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} stroke="hsl(215 40% 22%)" strokeWidth="5" fill="none" />
        <circle
          cx="32" cy="32" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold tabular-nums">{formatScore(score) || "—"}</span>
      </div>
    </div>
  );
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { data: patients = [], isLoading } = usePatients();

  const filtered = (patients as any[]).filter((p) => {
    const matchesSearch = (p.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (p.risk_level ?? "").toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const filterButtons: { key: Filter; label: string; cls: string }[] = [
    { key: "all", label: "All", cls: "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground" },
    { key: "high", label: "High Risk", cls: "data-[active=true]:bg-destructive data-[active=true]:text-destructive-foreground" },
    { key: "medium", label: "Medium", cls: "data-[active=true]:bg-warning data-[active=true]:text-warning-foreground" },
    { key: "low", label: "Low", cls: "data-[active=true]:bg-success data-[active=true]:text-success-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {patients.length} patients</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card/60 border-border/60 focus-visible:ring-primary focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_hsl(188_100%_50%/0.15)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((b) => (
            <button
              key={b.key}
              data-active={filter === b.key}
              onClick={() => setFilter(b.key)}
              className={cn(
                "px-4 h-10 rounded-lg text-sm font-medium border border-border/60 bg-card/40 text-muted-foreground transition-all hover:text-foreground",
                b.cls,
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-foreground font-medium">No patients found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: any, i) => {
            const lvl = (p.risk_level ?? "").toLowerCase() as "high" | "medium" | "low";
            return (
              <Card
                key={p.id}
                className="glass-card hover-lift animate-fade-in group"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <InitialsAvatar name={cleanText(p.name)} size={48} riskLevel={lvl} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{cleanText(p.name) || "Unnamed"}</p>
                        {p.age != null && <p className="text-xs text-muted-foreground">Age {p.age}{p.gender ? ` · ${p.gender}` : ""}</p>}
                      </div>
                    </div>
                    <RiskGauge score={p.risk_score} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <RiskBadge level={p.risk_level} score={p.risk_score} />
                    {p.stroke_severity && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 text-secondary-foreground text-[10px] font-semibold uppercase tracking-wider border border-border/60">
                        <Activity className="h-3 w-3" />{cleanText(p.stroke_severity)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {p.distance_km != null && (
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{p.distance_km} km from clinic</div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{cleanText(p.phone)}</div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40">
                      <Eye className="h-3.5 w-3.5" />View
                    </Button>
                    {p.phone && (
                      <Button size="sm" variant="outline" className="border-border/60 hover:bg-success/10 hover:text-success hover:border-success/40">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

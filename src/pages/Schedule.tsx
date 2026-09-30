import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAddPatient } from "@/hooks/usePatients";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Flame } from "lucide-react";
import { cleanText } from "@/lib/format";
import { formatAppointmentTime } from "@/lib/time";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 8 → 17

const DAY_KEY: Record<string, string> = {
  monday: "Monday", mon: "Monday",
  tuesday: "Tuesday", tue: "Tuesday", tues: "Tuesday",
  wednesday: "Wednesday", wed: "Wednesday",
  thursday: "Thursday", thu: "Thursday", thur: "Thursday", thurs: "Thursday",
  friday: "Friday", fri: "Friday",
  saturday: "Saturday", sat: "Saturday",
  sunday: "Sunday", sun: "Sunday",
};

function normalizeRisk(level: unknown, score: unknown): "high" | "medium" | "low" | null {
  const l = String(level ?? "").toLowerCase();
  if (l === "high" || l === "medium" || l === "low") return l as any;
  const n = typeof score === "number" ? score : parseFloat(String(score));
  if (Number.isFinite(n)) {
    if (n >= 0.7) return "high";
    if (n >= 0.4) return "medium";
    return "low";
  }
  return null;
}

function riskBlockColor(level: string | null) {
  if (level === "high") return "bg-destructive/15 border-destructive/40 text-destructive hover:bg-destructive/25";
  if (level === "medium") return "bg-warning/15 border-warning/40 text-warning hover:bg-warning/25";
  if (level === "low") return "bg-success/15 border-success/40 text-success hover:bg-success/25";
  return "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20";
}

function riskBadgeColor(level: string | null) {
  if (level === "high") return "bg-destructive/25 text-destructive";
  if (level === "medium") return "bg-warning/25 text-warning";
  if (level === "low") return "bg-success/25 text-success";
  return "bg-muted/40 text-muted-foreground";
}

function therapistInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 3).toUpperCase() || "—";
}

function useScheduleAppointments() {
  return useQuery({
    queryKey: ["appointments", "schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(name, risk_level, risk_score, phone)");
      if (error) throw error;
      return (data ?? []).map((a: any) => ({
        ...a,
        patient_name: a.patients?.name ?? a.patient_name ?? "—",
        risk_level: a.patients?.risk_level ?? a.risk_level ?? null,
        risk_score: a.patients?.risk_score ?? a.risk_score ?? null,
      }));
    },
  });
}

function PatientRegistrationDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", age: "", gender: "male", strokeSeverity: "mild",
    daysSinceStroke: "", distanceKm: "", hasCaregiver: false,
    transportType: "public", financialConstraint: false,
  });
  const addPatient = useAddPatient();

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.age) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addPatient.mutate(
      {
        name: form.name, phone: form.phone, age: parseInt(form.age),
        gender: form.gender as "male" | "female",
        stroke_severity: form.strokeSeverity as "mild" | "moderate" | "severe",
        days_since_stroke: form.daysSinceStroke ? parseInt(form.daysSinceStroke) : undefined,
        distance_km: form.distanceKm ? parseFloat(form.distanceKm) : undefined,
        has_caregiver: form.hasCaregiver,
        transport_type: form.transportType as "private" | "public" | "ambulance",
        financial_constraint: form.financialConstraint,
        date_added: new Date().toISOString().split("T")[0],
      },
      {
        onSuccess: () => {
          toast.success(`Patient "${form.name}" registered`);
          setOpen(false);
          setForm({ name: "", phone: "", age: "", gender: "male", strokeSeverity: "mild", daysSinceStroke: "", distanceKm: "", hasCaregiver: false, transportType: "public", financialConstraint: false });
        },
        onError: () => toast.error("Failed to register patient."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-cyan text-background hover:shadow-[0_0_20px_hsl(188_100%_50%/0.5)] transition-shadow">
          <Plus className="h-4 w-4" />New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>Register new patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Adebayo Ogunlesi" /></div>
            <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+234 ..." /></div>
            <div className="space-y-2"><Label>Age *</Label><Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stroke Severity</Label>
              <Select value={form.strokeSeverity} onValueChange={(v) => update("strokeSeverity", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Days Since Stroke</Label><Input type="number" value={form.daysSinceStroke} onChange={(e) => update("daysSinceStroke", e.target.value)} /></div>
            <div className="space-y-2"><Label>Distance from Clinic (km)</Label><Input type="number" value={form.distanceKm} onChange={(e) => update("distanceKm", e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Transport Type</Label>
              <Select value={form.transportType} onValueChange={(v) => update("transportType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem><SelectItem value="public">Public</SelectItem><SelectItem value="ambulance">Ambulance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3"><Switch checked={form.hasCaregiver} onCheckedChange={(v) => update("hasCaregiver", v)} /><Label>Has Caregiver</Label></div>
            <div className="flex items-center gap-3"><Switch checked={form.financialConstraint} onCheckedChange={(v) => update("financialConstraint", v)} /><Label>Financial Constraint</Label></div>
          </div>
          <Button type="submit" className="w-full bg-gradient-cyan text-background" disabled={addPatient.isPending}>
            {addPatient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Patient
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Schedule() {
  const { data: appointments = [], isLoading } = useScheduleAppointments();
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("schedule-appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Bucket by day → hour, plus per-day counts
  const { grid, dayCounts } = useMemo(() => {
    const m: Record<string, Record<number, any[]>> = {};
    const counts: Record<string, number> = {};
    for (const d of DAYS) { m[d] = {}; counts[d] = 0; }
    for (const a of appointments as any[]) {
      const dayKey = DAY_KEY[String(a.day ?? "").toLowerCase().trim()];
      if (!dayKey) continue;
      const rawHour = a.hour ?? a.time;
      const hour = typeof rawHour === "number" ? rawHour : parseInt(String(rawHour ?? "").split(":")[0], 10);
      if (isNaN(hour) || hour < 8 || hour > 17) continue;
      m[dayKey][hour] = m[dayKey][hour] || [];
      m[dayKey][hour].push(a);
      counts[dayKey] += 1;
    }
    return { grid: m, dayCounts: counts };
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">Monday–Sunday, 8:00 AM – 5:00 PM</p>
        </div>
        <PatientRegistrationDialog />
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            This Week {isLoading && <Loader2 className="inline h-3.5 w-3.5 ml-2 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <TooltipProvider>
            <div className="min-w-[1000px] grid grid-cols-[64px_repeat(7,1fr)] gap-2">
              <div />
              {DAYS.map((d) => {
                const busy = dayCounts[d] >= 3;
                return (
                  <div key={d} className="text-center py-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
                    {busy && (
                      <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-[9px] font-semibold border border-destructive/30">
                        <Flame className="h-2.5 w-2.5" />BUSY · {dayCounts[d]}
                      </div>
                    )}
                  </div>
                );
              })}
              {HOURS.map((h) => (
                <div key={`row-${h}`} className="contents">
                  <div className="text-right text-[11px] text-muted-foreground tabular-nums pr-2 pt-2">
                    {h.toString().padStart(2, "0")}:00
                  </div>
                  {DAYS.map((d) => {
                    const slots = grid[d][h] ?? [];
                    return (
                      <div key={`${d}-${h}`} className="min-h-[60px] rounded-lg border border-dashed border-border/40 p-1.5 space-y-1 bg-muted/5">
                        {slots.map((a, idx) => {
                          const level = normalizeRisk(a.risk_level, a.risk_score);
                          const therapist = cleanText(a.therapist_name ?? a.therapist) || "—";
                          return (
                            <Tooltip key={`${a.id}-${idx}`}>
                              <TooltipTrigger asChild>
                                <div className={cn("rounded-md border px-2 py-1.5 text-[11px] cursor-pointer transition-all", riskBlockColor(level))}>
                                  <div className="font-semibold truncate">{cleanText(a.patient_name)}</div>
                                  <div className="flex items-center justify-between gap-1 mt-0.5">
                                    <span className={cn("px-1 rounded text-[9px] font-bold", riskBadgeColor(level))}>
                                      {(level ?? "n/a").toUpperCase().slice(0, 4)}
                                    </span>
                                    <span className="opacity-70 truncate text-[10px]">{therapistInitials(therapist)}</span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs space-y-0.5">
                                  <p className="font-semibold">{cleanText(a.patient_name)}</p>
                                  <p>Therapist: {therapist}</p>
                                  <p>Room: {cleanText(a.room) || "—"}</p>
                                  <p>Time: {formatAppointmentTime(a.day, a.hour ?? a.time)}</p>
                                  <p>Risk: {level ?? "n/a"}{a.risk_score != null ? ` (${Number(a.risk_score).toFixed(2)})` : ""}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </TooltipProvider>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Legend</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border border-destructive/40 bg-destructive/20" />High Risk
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border border-warning/40 bg-warning/20" />Medium Risk
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border border-success/40 bg-success/20" />Low Risk
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Flame className="h-3 w-3 text-destructive" /> 3+ appointments = Busy day
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/RiskBadge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePatients } from "@/hooks/usePatients";
import { useOverviewStats } from "@/hooks/useStats";
import { Users, CalendarCheck, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Send, Check, X, Loader2, Pencil } from "lucide-react";
import { cleanText } from "@/lib/format";
import { formatAppointmentTime } from "@/lib/time";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAY_INDEX: Record<string, number> = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3, thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5, saturday: 6, sat: 6,
};

function appointmentDateTime(day?: string | null, time?: string | null): Date | null {
  if (!day) return null;
  const dayStr = String(day).trim();
  const iso = new Date(dayStr);
  if (!isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}/.test(dayStr)) {
    if (time) {
      const [h, m] = String(time).split(":").map(Number);
      if (!isNaN(h)) iso.setHours(h, m || 0, 0, 0);
    }
    return iso;
  }
  const idx = DAY_INDEX[dayStr.toLowerCase()];
  if (idx === undefined) return null;
  const now = new Date();
  const diff = (now.getDay() - idx + 7) % 7;
  const d = new Date(now);
  d.setDate(now.getDate() - diff);
  if (time) {
    const [h, m] = String(time).split(":").map(Number);
    if (!isNaN(h)) d.setHours(h, m || 0, 0, 0);
  }
  return d;
}

const isAttended = (a: any) => a.attended === true || a.attended === "true" || a.status === "attended";
const isNoShow = (a: any) => (a.attended === false || a.attended === "false" || a.status === "no-show")
  && (() => { const dt = appointmentDateTime(a.day, a.time); return dt ? dt.getTime() < Date.now() : false; })();

function StatCard({
  label, value, icon: Icon, gradient, trend, trendUp, isLoading,
}: any) {
  return (
    <Card className="glass-card hover-lift overflow-hidden relative">
      <div className={`absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-20 blur-2xl ${gradient}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${gradient} shadow-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {trendUp ? <ArrowUpRight className="h-3 w-3 text-success" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
            <span className={trendUp ? "text-success" : "text-destructive"}>{trend}</span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const { data: appointments = [], isLoading: loadingAppts } = useAppointments();
  const { data: patients = [] } = usePatients();
  const stats = useOverviewStats();
  const queryClient = useQueryClient();
  const [pendingMap, setPendingMap] = useState<Record<string, "attended" | "no-show">>({});
  const [optimisticMap, setOptimisticMap] = useState<Record<string, boolean | null>>({});
  const [editingMap, setEditingMap] = useState<Record<string, boolean>>({});

  const handleAttendance = async (a: any, attended: boolean) => {
    const id = a.id as string;
    if (!id) return;
    if (pendingMap[id]) return;
    const patientName = cleanText(a.patient_name);
    const phone = a.phone ?? "";
    setPendingMap((m) => ({ ...m, [id]: attended ? "attended" : "no-show" }));
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ attended })
        .eq("id", id);
      if (error) {
        toast.error(`Update failed: ${error.message}`);
        return;
      }
      setOptimisticMap((m) => ({ ...m, [id]: attended }));
      setEditingMap((m) => {
        const { [id]: _, ...rest } = m;
        return rest;
      });
      if (attended) {
        toast.success("Marked as attended");
      } else {
        toast.error("Marked as no-show");
      }
      fetch("https://enny27.app.n8n.cloud/webhook/attendance-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: id, attended, name: patientName, phone }),
      }).catch((e) => console.warn("Webhook failed", e));
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["attendance_rate"] });
      queryClient.invalidateQueries({ queryKey: ["past_no_shows"] });
    } catch (e: any) {
      console.error("Attendance update error", e);
      toast.error(`Error: ${e?.message ?? "Failed to update"}`);
    } finally {
      setPendingMap((m) => {
        const { [id]: _, ...rest } = m;
        return rest;
      });
    }
  };

  const toggleEdit = (id: string) => {
    setEditingMap((m) => ({ ...m, [id]: !m[id] }));
  };

  const formatRate = (val: unknown): string => {
    if (val === null || val === undefined || val === "") return "—";
    const n = typeof val === "number" ? val : parseFloat(String(val));
    if (!Number.isFinite(n)) return String(val);
    return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
  };

  const riskBuckets = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    for (const p of patients as any[]) {
      const lvl = (p.risk_level ?? "").toLowerCase();
      if (lvl === "high" || lvl === "medium" || lvl === "low") counts[lvl as keyof typeof counts]++;
    }
    return counts;
  }, [patients]);

  const riskData = [
    { name: "High", value: riskBuckets.high, color: "hsl(351 100% 62%)" },
    { name: "Medium", value: riskBuckets.medium, color: "hsl(41 100% 50%)" },
    { name: "Low", value: riskBuckets.low, color: "hsl(145 100% 45%)" },
  ];

  const highRisk = (appointments as any[])
    .filter((a) => (a.risk_level ?? "").toLowerCase() === "high" && !isAttended(a))
    .slice(0, 5);

  const renderStatus = (a: any) => {
    if (isAttended(a)) {
      return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium border border-success/30">Attended</span>;
    }
    if (isNoShow(a)) {
      return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-medium border border-destructive/30">No-show</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground text-xs font-medium border border-border">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />Scheduled
    </span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of your rehabilitation operations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={<AnimatedNumber value={stats.totalPatients} />} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" trend="+12%" trendUp isLoading={stats.isLoading} />
        <StatCard label="Appointments" value={<AnimatedNumber value={stats.totalAppointments} />} icon={CalendarCheck} gradient="bg-gradient-cyan" trend="+5%" trendUp isLoading={stats.isLoading} />
        <StatCard label="Attendance Rate" value={stats.attendanceRate} icon={TrendingUp} gradient="bg-gradient-success" trend="+2.3%" trendUp isLoading={stats.isLoading} />
        <StatCard label="No-Shows" value={<AnimatedNumber value={stats.noShows} />} icon={AlertTriangle} gradient="bg-gradient-danger" trend="-8%" trendUp={false} isLoading={stats.isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="glass-card lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Appointments</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Latest scheduled sessions</p>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Patient</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAppts ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : (appointments as any[]).slice(0, 6).map((a) => {
                  const optimistic = optimisticMap[a.id];
                  const baseAttended = isAttended(a) ? true : isNoShow(a) ? false : null;
                  const effectiveAttended = optimistic !== undefined ? optimistic : baseAttended;
                  const rowPending = pendingMap[a.id];
                  const isLocked = !!rowPending;
                  const isEditing = !!editingMap[a.id];
                  const showButtons = effectiveAttended === null || isEditing;
                  return (
                  <TableRow key={a.id} className="border-border/40 transition-colors hover:bg-primary/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={cleanText(a.patient_name)} size={32} riskLevel={a.risk_level} />
                        <span className="font-medium">{cleanText(a.patient_name)}</span>
                      </div>
                    </TableCell>
                    <TableCell><RiskBadge score={a.risk_score} level={a.risk_level} /></TableCell>
                    <TableCell className="text-muted-foreground">{cleanText(a.therapist_name ?? a.therapist) || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatAppointmentTime(a.day, a.hour ?? a.time)}</TableCell>
                    <TableCell>{renderStatus(a)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end items-center">
                        {!showButtons && effectiveAttended === true && (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold border border-success/30">
                              <Check className="h-3 w-3" />Attended ✓
                            </span>
                            <button onClick={() => toggleEdit(a.id)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors" title="Edit attendance">
                              <Pencil className="h-3 w-3" />Edit
                            </button>
                          </>
                        )}
                        {!showButtons && effectiveAttended === false && (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold border border-destructive/30">
                              <X className="h-3 w-3" />No-Show ✗
                            </span>
                            <button onClick={() => toggleEdit(a.id)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors" title="Edit attendance">
                              <Pencil className="h-3 w-3" />Edit
                            </button>
                          </>
                        )}
                        {showButtons && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn(
                                "border-success/40 text-success",
                                isLocked
                                  ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-success hover:shadow-none"
                                  : "hover:bg-success hover:text-success-foreground"
                              )}
                              onClick={() => handleAttendance(a, true)}
                              disabled={isLocked}
                            >
                              {rowPending === "attended" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn(
                                "border-destructive/40 text-destructive",
                                isLocked
                                  ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-destructive hover:shadow-none"
                                  : "hover:bg-destructive hover:text-destructive-foreground"
                              )}
                              onClick={() => handleAttendance(a, false)}
                              disabled={isLocked}
                            >
                              {rowPending === "no-show" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            </Button>
                            {isEditing && (
                              <button onClick={() => toggleEdit(a.id)} className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-1">
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {!loadingAppts && appointments.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12">No appointments scheduled.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Patient population breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] animate-scale-in">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(217 60% 13%)", border: "1px solid hsl(215 40% 22%)", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {riskData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name} risk</span>
                  </div>
                  <span className="font-semibold tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
              Upcoming High Risk Patients
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Priority outreach recommended</p>
          </div>
        </CardHeader>
        <CardContent>
          {highRisk.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No high-risk appointments pending.</p>
          ) : (
            <div className="space-y-2">
              {highRisk.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                  <div className="relative">
                    <InitialsAvatar name={cleanText(a.patient_name)} size={40} riskLevel="high" />
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive animate-pulse-dot" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cleanText(a.patient_name)}</p>
                    <p className="text-xs text-muted-foreground">{formatAppointmentTime(a.day, a.hour ?? a.time)} · {cleanText(a.therapist_name ?? a.therapist) || "Unassigned"}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => toast.success(`Reminder queued for ${cleanText(a.patient_name)}`)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Reminder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

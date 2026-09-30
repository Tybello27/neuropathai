import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/RiskBadge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cleanText } from "@/lib/format";
import { formatAppointmentTime } from "@/lib/time";
import { Check, X, LayoutGrid, Table as TableIcon, CalendarDays, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const attendedStatus = (a: any): "attended" | "no-show" | "pending" => {
  if (a.attended === true || a.attended === "true" || a.status === "attended") return "attended";
  if (a.attended === false || a.attended === "false" || a.status === "no-show") return "no-show";
  return "pending";
};

type View = "table" | "calendar";

const STATUS_PILLS = {
  attended: "bg-success/15 text-success border-success/30 shadow-[0_0_12px_hsl(145_100%_45%/0.25)]",
  "no-show": "bg-destructive/15 text-destructive border-destructive/30 shadow-[0_0_12px_hsl(351_100%_62%/0.25)]",
  pending: "bg-muted/40 text-muted-foreground border-border",
};

function StatusPill({ status }: { status: string }) {
  if (status === "attended") {
    return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", STATUS_PILLS.attended)}>
      <Check className="h-3 w-3" />Attended
    </span>;
  }
  if (status === "no-show") {
    return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", STATUS_PILLS["no-show"])}>
      <X className="h-3 w-3" />No-show
    </span>;
  }
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", STATUS_PILLS.pending)}>
    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />Pending
  </span>;
}

export default function Appointments() {
  const [view, setView] = useState<View>("table");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingMap, setPendingMap] = useState<Record<string, "attended" | "no-show">>({});
  const [optimisticMap, setOptimisticMap] = useState<Record<string, boolean | null>>({});
  const [editingMap, setEditingMap] = useState<Record<string, boolean>>({});
  const { data: appointments = [], isLoading } = useAppointments();
  const queryClient = useQueryClient();

  const filtered = (appointments as any[]).filter((a) => {
    const status = attendedStatus(a);
    if (riskFilter !== "all" && (a.risk_level ?? "").toLowerCase() !== riskFilter) return false;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    return true;
  });

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
      // Fire-and-forget webhook (non-blocking)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage attendance and verify sessions in real time.</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card/60 border border-border/60 self-start">
          <button
            onClick={() => setView("table")}
            className={cn("flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all",
              view === "table" ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(188_100%_50%/0.4)]" : "text-muted-foreground hover:text-foreground")}
          >
            <TableIcon className="h-3.5 w-3.5" />Table
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn("flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all",
              view === "calendar" ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(188_100%_50%/0.4)]" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />Calendar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[160px] bg-card/60 border-border/60"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-card/60 border-border/60"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="no-show">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === "calendar" ? (
        <Card className="glass-card">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-foreground font-medium">Calendar view</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Visit the <a href="/schedule" className="text-primary hover:underline">Schedule</a> page for the weekly calendar grid.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="overflow-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Patient</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">No appointments match your filters.</TableCell></TableRow>
                ) : filtered.map((a: any) => {
                  const optimistic = optimisticMap[a.id];
                  const effectiveAttended = optimistic !== undefined ? optimistic : (attendedStatus(a) === "attended" ? true : attendedStatus(a) === "no-show" ? false : null);
                  const status = effectiveAttended === true ? "attended" : effectiveAttended === false ? "no-show" : "pending";
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
                      <TableCell className="text-muted-foreground">{cleanText(a.therapist_name ?? a.therapist) || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{cleanText(a.room) || "—"}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {formatAppointmentTime(a.day, a.hour ?? a.time)}
                      </TableCell>
                      <TableCell><RiskBadge score={a.risk_score} level={a.risk_level} /></TableCell>
                      <TableCell><StatusPill status={status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end items-center">
                          {!showButtons && effectiveAttended === true && (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold border border-success/30">
                                <Check className="h-3.5 w-3.5" />Attended ✓
                              </span>
                              <button
                                onClick={() => toggleEdit(a.id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                title="Edit attendance"
                              >
                                <Pencil className="h-3 w-3" />Edit
                              </button>
                            </>
                          )}
                          {!showButtons && effectiveAttended === false && (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold border border-destructive/30">
                                <X className="h-3.5 w-3.5" />No-Show ✗
                              </span>
                              <button
                                onClick={() => toggleEdit(a.id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                title="Edit attendance"
                              >
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
                                    : "hover:bg-success hover:text-success-foreground hover:shadow-[0_0_16px_hsl(145_100%_45%/0.5)]"
                                )}
                                onClick={() => handleAttendance(a, true)}
                                disabled={isLocked}
                              >
                                {rowPending === "attended" ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  "border-destructive/40 text-destructive",
                                  isLocked
                                    ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-destructive hover:shadow-none"
                                    : "hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_16px_hsl(351_100%_62%/0.5)]"
                                )}
                                onClick={() => handleAttendance(a, false)}
                                disabled={isLocked}
                              >
                                {rowPending === "no-show" ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              {isEditing && (
                                <button
                                  onClick={() => toggleEdit(a.id)}
                                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-1"
                                >
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

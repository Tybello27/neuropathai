import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { RiskBadge } from "@/components/RiskBadge";
import { Bell, Phone, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { cleanText } from "@/lib/format";

const TYPES = ["whatsapp", "call"] as const;

export default function Reminders() {
  const { data: appointments = [] } = useAppointments();

  // Derive a placeholder reminder log from appointments
  const reminders = (appointments as any[]).slice(0, 12).map((a, i) => ({
    id: a.id,
    patient: a.patient_name,
    risk: a.risk_level,
    type: TYPES[i % 2],
    sentAt: new Date(Date.now() - i * 3600 * 1000),
    delivered: i % 5 !== 4,
  }));

  const total = reminders.length;
  const delivered = reminders.filter((r) => r.delivered).length;
  const failed = total - delivered;

  const stats = [
    { label: "Total Sent", value: total, icon: Bell, color: "from-cyan-500 to-blue-600" },
    { label: "Delivered", value: delivered, icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
    { label: "Failed", value: failed, icon: XCircle, color: "from-rose-500 to-pink-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
        <p className="text-sm text-muted-foreground mt-1">Outreach activity across all channels.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</CardTitle>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${s.color} shadow-lg`}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Reminder Log</CardTitle></CardHeader>
        <CardContent className="overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">No reminders sent yet.</TableCell></TableRow>
              ) : reminders.map((r) => (
                <TableRow key={r.id + r.sentAt.toISOString()} className="border-border/40 hover:bg-primary/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={cleanText(r.patient)} size={32} riskLevel={r.risk} />
                      <span className="font-medium">{cleanText(r.patient)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/40 text-secondary-foreground text-xs font-medium border border-border/60">
                      {r.type === "whatsapp" ? <MessageCircle className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                      {r.type === "whatsapp" ? "WhatsApp" : "Call"}
                    </span>
                  </TableCell>
                  <TableCell><RiskBadge level={r.risk} /></TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{r.sentAt.toLocaleString()}</TableCell>
                  <TableCell>
                    {r.delivered ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium border border-success/30"><CheckCircle2 className="h-3 w-3" />Delivered</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-medium border border-destructive/30"><XCircle className="h-3 w-3" />Failed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

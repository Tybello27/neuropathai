import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const apis = [
  { name: "Prediction API", status: "ok" },
  { name: "ASP Scheduler", status: "ok" },
  { name: "Lovable Cloud (DB)", status: "ok" },
  { name: "Twilio", status: "down" },
  { name: "n8n Webhooks", status: "ok" },
];

const therapists = ["Dr. Adaeze Okonkwo", "Dr. Kunle Adeyemi", "Dr. Ifeoma Eze"];
const rooms = ["Room A", "Room B", "Room C"];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configuration, integrations, and preferences.</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Clinic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Clinic Name</Label><Input defaultValue="StrokeRehab Nigeria" /></div>
          <div className="space-y-2"><Label>Contact Email</Label><Input defaultValue="admin@strokerehab.ng" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+234 800 000 0000" /></div>
          <div className="space-y-2"><Label>Address</Label><Input defaultValue="Victoria Island, Lagos" /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Therapists</CardTitle>
            <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">+ Add</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {therapists.map((t) => (
              <div key={t} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
                <span className="text-sm">{t}</span>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">Remove</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Rooms</CardTitle>
            <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">+ Add</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {rooms.map((r) => (
              <div key={r} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
                <span className="text-sm">{r}</span>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">Remove</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Send WhatsApp reminders", desc: "Automatically message patients 24h before appointment" },
            { label: "Send call reminders for high risk", desc: "Trigger an automated call to high-risk patients" },
            { label: "Daily summary email", desc: "Receive an end-of-day operational digest" },
          ].map((n, i) => (
            <div key={n.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked={i !== 2} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">System Status</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {apis.map((a) => (
            <div key={a.name} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
              <span className="text-sm">{a.name}</span>
              <span className={`inline-flex items-center gap-2 text-xs font-medium ${a.status === "ok" ? "text-success" : "text-destructive"}`}>
                <span className={`h-2 w-2 rounded-full ${a.status === "ok" ? "bg-success animate-pulse-dot" : "bg-destructive"}`} />
                {a.status === "ok" ? "Operational" : "Down"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

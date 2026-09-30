import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const cyan = "hsl(188 100% 50%)";
const blue = "hsl(210 100% 55%)";
const amber = "hsl(41 100% 50%)";
const teal = "hsl(170 80% 45%)";
const danger = "hsl(351 100% 62%)";
const success = "hsl(145 100% 45%)";

const tooltipStyle = { background: "hsl(217 60% 13%)", border: "1px solid hsl(215 40% 22%)", borderRadius: 8, fontSize: 12, color: "hsl(218 38% 94%)" };

const attendance = [
  { week: "W1", rate: 78 }, { week: "W2", rate: 81 }, { week: "W3", rate: 76 },
  { week: "W4", rate: 84 }, { week: "W5", rate: 88 }, { week: "W6", rate: 86 },
  { week: "W7", rate: 91 }, { week: "W8", rate: 93 },
];
const noShowsByDay = [
  { day: "Mon", count: 8 }, { day: "Tue", count: 5 }, { day: "Wed", count: 11 },
  { day: "Thu", count: 6 }, { day: "Fri", count: 14 },
];
const noShowsByDistance = [
  { range: "0-5km", count: 4 }, { range: "5-10km", count: 9 },
  { range: "10-20km", count: 14 }, { range: "20-50km", count: 22 }, { range: "50km+", count: 18 },
];
const transport = [
  { name: "Public", value: 48, color: cyan },
  { name: "Private", value: 34, color: blue },
  { name: "Ambulance", value: 18, color: amber },
];
const newPatients = [
  { week: "W1", count: 12 }, { week: "W2", count: 18 }, { week: "W3", count: 15 },
  { week: "W4", count: 22 }, { week: "W5", count: 28 }, { week: "W6", count: 24 },
  { week: "W7", count: 31 }, { week: "W8", count: 36 },
];

const metrics = [
  { label: "Avg Risk Score", value: "0.42" },
  { label: "Most Common Severity", value: "Moderate" },
  { label: "Best Day", value: "Tuesday" },
  { label: "Worst Day", value: "Friday" },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance and operational insights. <span className="text-warning">Sample data — wire to live queries when ready.</span></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="glass-card">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-2 text-gradient-cyan">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Attendance Rate (Last 8 Weeks)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendance}>
                  <defs>
                    <linearGradient id="lineG" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor={cyan} /><stop offset="100%" stopColor={blue} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(215 40% 22%)" strokeDasharray="3 3" />
                  <XAxis dataKey="week" stroke="hsl(215 20% 65%)" fontSize={11} />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="rate" stroke="url(#lineG)" strokeWidth={3} dot={{ fill: cyan, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">No-Shows by Day</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={noShowsByDay}>
                  <CartesianGrid stroke="hsl(215 40% 22%)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="hsl(215 20% 65%)" fontSize={11} />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(188 100% 50% / 0.06)" }} />
                  <Bar dataKey="count" fill={cyan} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">No-Shows by Distance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={noShowsByDistance}>
                  <CartesianGrid stroke="hsl(215 40% 22%)" strokeDasharray="3 3" />
                  <XAxis dataKey="range" stroke="hsl(215 20% 65%)" fontSize={11} />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(188 100% 50% / 0.06)" }} />
                  <Bar dataKey="count" fill={teal} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Transport Type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={transport} innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3} stroke="none">
                    {transport.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(215 20% 65%)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">New Patients per Week</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={newPatients}>
                <defs>
                  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cyan} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(215 40% 22%)" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="hsl(215 20% 65%)" fontSize={11} />
                <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke={cyan} strokeWidth={2} fill="url(#areaG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

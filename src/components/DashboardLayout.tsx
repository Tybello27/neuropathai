import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/patients": "Patients",
  "/appointments": "Appointments",
  "/schedule": "Schedule",
  "/reminders": "Reminders",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Dashboard";
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* subtle background pattern */}
          <div className="pointer-events-none absolute inset-0 dot-bg opacity-30" />
          <header className="relative h-16 flex items-center justify-between border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 md:px-6 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</span>
                <span className="text-muted-foreground/40">/</span>
                <h1 className="text-sm font-semibold text-foreground">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                <span className="text-[11px] font-medium text-success">Live</span>
              </div>
            </div>
          </header>
          <main className="relative flex-1 p-4 md:p-8 overflow-auto z-0">
            <div className="animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

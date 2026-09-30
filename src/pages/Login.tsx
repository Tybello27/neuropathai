import { useState, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setError(null);
    setDemoSubmitting(true);
    const { error: err } = await supabase.auth.signInAnonymously();
    setDemoSubmitting(false);
    if (err) {
      toast.error("Demo mode unavailable.");
      return;
    }
    navigate("/", { replace: true });
  };

  if (!loading && session) {
    const from = (location.state as any)?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) {
      setError("Access denied. Contact your administrator to request access.");
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-background px-4">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 dot-bg opacity-30" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl animate-float-slower" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        {/* Floating particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-primary/60 animate-particle"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 31) % 100}%`,
              animationDelay: `${(i % 9) * 0.7}s`,
              animationDuration: `${8 + (i % 6)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="glass-card p-8 md:p-10 border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size={56} showText={false} />
            <h1 className="mt-5 text-2xl font-bold text-foreground tracking-tight">
              StrokeRehab <span className="text-gradient-cyan">Nigeria</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Integrated Stroke Rehabilitation Scheduling
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background/40 border-white/10 focus-visible:ring-primary/50"
                  placeholder="you@clinic.org"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background/40 border-white/10 focus-visible:ring-primary/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full h-11 rounded-md font-semibold text-background bg-gradient-cyan shadow-[0_0_24px_hsl(188_100%_50%/0.35)] hover:shadow-[0_0_36px_hsl(188_100%_50%/0.65)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Signing in…" : "Sign In"}
              </span>
            </button>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoSubmitting || submitting}
                className="w-full h-11 rounded-md font-medium text-foreground border border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {demoSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
                  {demoSubmitting ? "Starting demo…" : "Continue as Demo User"}
                </span>
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                For evaluation purposes only.
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Authorized clinical staff only
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

import { Brain } from "lucide-react";

export function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-cyan shadow-[0_0_24px_hsl(188_100%_50%/0.45)]"
        style={{ width: size, height: size }}
      >
        {/* Medical cross */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: size * 0.5, height: size * 0.5 }}>
            <span className="absolute left-1/2 top-0 h-full w-[18%] -translate-x-1/2 rounded-full bg-background/90" />
            <span className="absolute top-1/2 left-0 h-[18%] w-full -translate-y-1/2 rounded-full bg-background/90" />
          </div>
        </div>
        {/* Brain hint */}
        <Brain
          className="absolute -bottom-1 -right-1 text-background/70"
          size={size * 0.4}
          strokeWidth={2.5}
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-foreground tracking-tight">
            StrokeRehab <span className="text-gradient-cyan">Nigeria</span>
          </span>
          <span className="text-[10px] text-muted-foreground tracking-wide">
            Intelligent Rehab Scheduling
          </span>
        </div>
      )}
    </div>
  );
}

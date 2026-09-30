import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OverviewStats {
  attendanceRate: string;
  noShows: number;
  totalPatients: number;
  totalAppointments: number;
  isLoading: boolean;
}

/**
 * Fetches all overview stats directly from Supabase with real-time updates.
 */
export function useOverviewStats(): OverviewStats {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["overview_stats"],
    queryFn: async (): Promise<OverviewStats> => {
      const { data: appointments, error: apptError } = await supabase
        .from("appointments")
        .select("attended");
      if (apptError) {
        console.error("appointments select error:", apptError);
        throw apptError;
      }

      const { count: patientsCount, error: patientError } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });
      if (patientError) {
        console.error("patients count error:", patientError);
        throw patientError;
      }

      const rows = (appointments ?? []) as { attended: boolean | null }[];
      const attended = rows.filter((a) => a.attended === true).length;
      const noShows = rows.filter((a) => a.attended === false).length;
      const total = rows.filter((a) => a.attended !== null).length;
      const rate = total > 0 ? (attended / total * 100).toFixed(1) : "0.0";

      return {
        attendanceRate: `${rate}%`,
        noShows,
        totalPatients: patientsCount ?? 0,
        totalAppointments: rows.length,
        isLoading: false,
      };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("overview-appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["overview_stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    data ?? {
      attendanceRate: "0.0%",
      noShows: 0,
      totalPatients: 0,
      totalAppointments: 0,
      isLoading,
    }
  );
}

/**
 * Fetches the attendance rate directly from the `attendance_rate` view.
 * Displays the value exactly as stored — no frontend recalculation.
 */
export function useAttendanceRate() {
  return useQuery({
    queryKey: ["attendance_rate"],
    queryFn: async (): Promise<number | string | null> => {
      const { data, error } = await supabase
        .from("attendance_stats" as any)
        .select("*")
        .limit(1);
      if (error) {
        console.error("attendance_stats view error:", error);
        throw error;
      }
      const row: any = Array.isArray(data) ? data[0] : data;
      if (!row) return null;
      // Pick the first numeric/string field that looks like a rate
      const preferred = ["attendance_rate", "rate", "value", "percentage"];
      for (const key of preferred) {
        if (row[key] !== undefined && row[key] !== null) return row[key];
      }
      // Fall back to the first non-null field
      const firstKey = Object.keys(row).find((k) => row[k] !== null && row[k] !== undefined);
      return firstKey ? row[firstKey] : null;
    },
  });
}

/**
 * Dynamic count of all rows in the `patients` table.
 */
export function usePatientsCount() {
  return useQuery({
    queryKey: ["patients_count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });
      if (error) {
        console.error("patients count error:", error);
        throw error;
      }
      return count ?? 0;
    },
  });
}

/**
 * Dynamic count of all rows in the `appointments` table.
 */
export function useAppointmentsCount() {
  return useQuery({
    queryKey: ["appointments_count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });
      if (error) {
        console.error("appointments count error:", error);
        throw error;
      }
      return count ?? 0;
    },
  });
}

const DAY_INDEX: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function isPast(day?: string | null, time?: string | null): boolean {
  const now = new Date();
  if (day) {
    const parsed = new Date(day);
    if (!isNaN(parsed.getTime())) {
      if (time) {
        const [h, m] = time.split(":").map(Number);
        if (!isNaN(h)) parsed.setHours(h, m || 0, 0, 0);
      }
      return parsed.getTime() < now.getTime();
    }
    const idx = DAY_INDEX[day.toLowerCase().trim()];
    if (idx !== undefined) {
      const today = now.getDay();
      if (idx < today) return true;
      if (idx === today && time) {
        const [h, m] = time.split(":").map(Number);
        const t = new Date();
        t.setHours(h || 0, m || 0, 0, 0);
        return t.getTime() < now.getTime();
      }
      return false;
    }
  }
  return false;
}

export function usePastNoShows() {
  return useQuery({
    queryKey: ["past_no_shows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_details")
        .select("*");
      if (error) throw error;
      return (data ?? []).filter((a: any) => {
        const isNotAttended = a.attended === false || a.attended === "false";
        return isNotAttended && isPast(a.day, a.time);
      }).length;
    },
  });
}

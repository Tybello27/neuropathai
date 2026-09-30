import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_details")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
}

const ATTENDANCE_WEBHOOK_URL =
  "https://enny27.app.n8n.cloud/webhook/attendance-update";

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appointment_id,
      attended,
      name,
      phone,
    }: {
      appointment_id: string;
      attended: boolean;
      name: string;
      phone?: string | null;
    }) => {
      // 1. Update Supabase first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      console.log('appointment_id:', appointment_id, 'session:', session?.user?.email);
      const { error } = await supabase
        .from("appointments")
        .update({ attended })
        .eq("id", appointment_id);
      if (error) throw error;

      // 2. Then fire the n8n webhook (non-blocking failure)
      try {
        await fetch(ATTENDANCE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointment_id,
            attended,
            name,
            phone: phone ?? "",
          }),
        });
      } catch (e) {
        console.warn("Webhook notification failed", e);
      }
      return { ok: true };
    },
    onMutate: async ({ appointment_id, attended }) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      const previous = queryClient.getQueryData<any[]>(["appointments"]);
      queryClient.setQueryData<any[]>(["appointments"], (old) =>
        (old ?? []).map((a) =>
          a.id === appointment_id
            ? { ...a, attended, status: attended ? "attended" : "no-show" }
            : a,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["appointments"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["attendance_rate"] });
      queryClient.invalidateQueries({ queryKey: ["appointments_count"] });
      queryClient.invalidateQueries({ queryKey: ["patients_count"] });
      queryClient.invalidateQueries({ queryKey: ["past_no_shows"] });
    },
  });
}

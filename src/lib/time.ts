const DAYS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function parseHour(hour: unknown): number | null {
  if (hour === null || hour === undefined || hour === "") return null;
  if (typeof hour === "number" && Number.isFinite(hour)) return hour;
  const s = String(hour).trim();
  // Accept "9", "09", "09:00", "09:00:00"
  const match = s.match(/^(\d{1,2})/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

export function formatAppointmentTime(
  day: unknown,
  hour: unknown,
): string {
  const dayStr = day ? String(day).trim().toLowerCase() : "";
  const dayName = DAYS[dayStr] ?? (day ? String(day) : "");
  const h = parseHour(hour);
  if (h === null) return dayName || "—";
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dayName} ${displayHour}:00 ${period}`.trim();
}

export const cleanText = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  return String(v).replace(/^=+/, "").trim();
};

export const formatScore = (v: unknown): string => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

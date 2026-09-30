export type RiskLevel = "high" | "medium" | "low";
export type StrokeSeverity = "mild" | "moderate" | "severe";
export type AttendanceStatus = "attended" | "no-show" | "pending";

export interface PatientRow {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female";
  stroke_severity: StrokeSeverity;
  days_since_stroke: number;
  distance_km: number;
  has_caregiver: boolean;
  transport_type: "private" | "public" | "ambulance";
  financial_constraint: boolean;
  risk_level: RiskLevel;
  risk_score: number;
  date_added: string;
  created_at: string;
}

export interface PatientInsert {
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female";
  stroke_severity: StrokeSeverity;
  days_since_stroke?: number;
  distance_km?: number;
  has_caregiver?: boolean;
  transport_type?: "private" | "public" | "ambulance";
  financial_constraint?: boolean;
  risk_level?: RiskLevel;
  risk_score?: number;
  date_added?: string;
}

export interface AppointmentRow {
  id: string;
  patient_id: string;
  patient_name: string;
  therapist: string;
  room: string;
  day: string;
  time: string;
  risk_level: RiskLevel;
  risk_score: number;
  status: AttendanceStatus;
  created_at: string;
}

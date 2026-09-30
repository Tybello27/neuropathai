export type RiskLevel = "high" | "medium" | "low";
export type StrokeSeverity = "mild" | "moderate" | "severe";
export type AttendanceStatus = "attended" | "no-show" | "pending";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female";
  strokeSeverity: StrokeSeverity;
  daysSinceStroke: number;
  distanceKm: number;
  hasCaregiver: boolean;
  transportType: "private" | "public" | "ambulance";
  financialConstraint: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  dateAdded: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  therapist: string;
  room: string;
  day: string;
  time: string;
  riskLevel: RiskLevel;
  riskScore: number;
  status: AttendanceStatus;
}

export const patients: Patient[] = [
  { id: "1", name: "Adebayo Ogunlesi", phone: "+234 812 345 6789", age: 62, gender: "male", strokeSeverity: "severe", daysSinceStroke: 14, distanceKm: 35, hasCaregiver: false, transportType: "public", financialConstraint: true, riskLevel: "high", riskScore: 87, dateAdded: "2025-03-15" },
  { id: "2", name: "Chidinma Eze", phone: "+234 803 456 7890", age: 55, gender: "female", strokeSeverity: "moderate", daysSinceStroke: 30, distanceKm: 12, hasCaregiver: true, transportType: "private", financialConstraint: false, riskLevel: "low", riskScore: 28, dateAdded: "2025-03-18" },
  { id: "3", name: "Musa Ibrahim", phone: "+234 809 567 8901", age: 70, gender: "male", strokeSeverity: "severe", daysSinceStroke: 7, distanceKm: 45, hasCaregiver: false, transportType: "ambulance", financialConstraint: true, riskLevel: "high", riskScore: 92, dateAdded: "2025-03-20" },
  { id: "4", name: "Ngozi Okafor", phone: "+234 816 678 9012", age: 48, gender: "female", strokeSeverity: "mild", daysSinceStroke: 60, distanceKm: 8, hasCaregiver: true, transportType: "private", financialConstraint: false, riskLevel: "low", riskScore: 15, dateAdded: "2025-03-22" },
  { id: "5", name: "Tunde Bakare", phone: "+234 805 789 0123", age: 58, gender: "male", strokeSeverity: "moderate", daysSinceStroke: 21, distanceKm: 22, hasCaregiver: false, transportType: "public", financialConstraint: true, riskLevel: "medium", riskScore: 64, dateAdded: "2025-03-25" },
  { id: "6", name: "Fatima Abdullahi", phone: "+234 811 890 1234", age: 65, gender: "female", strokeSeverity: "severe", daysSinceStroke: 10, distanceKm: 50, hasCaregiver: false, transportType: "public", financialConstraint: true, riskLevel: "high", riskScore: 95, dateAdded: "2025-04-01" },
  { id: "7", name: "Emeka Nwankwo", phone: "+234 802 901 2345", age: 52, gender: "male", strokeSeverity: "mild", daysSinceStroke: 45, distanceKm: 5, hasCaregiver: true, transportType: "private", financialConstraint: false, riskLevel: "low", riskScore: 18, dateAdded: "2025-04-03" },
  { id: "8", name: "Aisha Bello", phone: "+234 813 012 3456", age: 60, gender: "female", strokeSeverity: "moderate", daysSinceStroke: 28, distanceKm: 30, hasCaregiver: true, transportType: "public", financialConstraint: false, riskLevel: "medium", riskScore: 52, dateAdded: "2025-04-05" },
];

export const appointments: Appointment[] = [
  { id: "1", patientName: "Adebayo Ogunlesi", therapist: "Dr. Amara Obi", room: "Room A1", day: "Monday", time: "09:00", riskLevel: "high", riskScore: 87, status: "attended" },
  { id: "2", patientName: "Chidinma Eze", therapist: "Dr. Folake Adeola", room: "Room B2", day: "Monday", time: "10:30", riskLevel: "low", riskScore: 28, status: "attended" },
  { id: "3", patientName: "Musa Ibrahim", therapist: "Dr. Amara Obi", room: "Room A1", day: "Tuesday", time: "09:00", riskLevel: "high", riskScore: 92, status: "no-show" },
  { id: "4", patientName: "Ngozi Okafor", therapist: "Dr. Chukwuma Eze", room: "Room C3", day: "Tuesday", time: "11:00", riskLevel: "low", riskScore: 15, status: "attended" },
  { id: "5", patientName: "Tunde Bakare", therapist: "Dr. Folake Adeola", room: "Room B2", day: "Wednesday", time: "09:00", riskLevel: "medium", riskScore: 64, status: "pending" },
  { id: "6", patientName: "Fatima Abdullahi", therapist: "Dr. Amara Obi", room: "Room A1", day: "Wednesday", time: "10:30", riskLevel: "high", riskScore: 95, status: "no-show" },
  { id: "7", patientName: "Emeka Nwankwo", therapist: "Dr. Chukwuma Eze", room: "Room C3", day: "Thursday", time: "09:00", riskLevel: "low", riskScore: 18, status: "pending" },
  { id: "8", patientName: "Aisha Bello", therapist: "Dr. Folake Adeola", room: "Room B2", day: "Thursday", time: "10:30", riskLevel: "medium", riskScore: 52, status: "pending" },
];

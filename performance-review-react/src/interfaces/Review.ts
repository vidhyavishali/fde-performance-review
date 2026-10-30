export  interface Review {
  id: number;
  employee_id: number;      // numeric key (10), NOT the EMP code
  employee_code: string;    // "EMP110"
  employee_name: string;
  period_id: number;
  period_name: string;
  quality_rating: number;
  delivery_rating: number;
  teamwork_rating: number;
  average_rating: number;
  comments: string | null;
  status: "Completed";
  created_at: string;       // ISO date text, e.g. "2026-10-25T10:22:00Z"
}


export type { Review as default };
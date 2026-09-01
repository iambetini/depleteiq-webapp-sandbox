export enum Status {
  active = "active",
  completed = "completed",
  expired = "expired",
}

export interface Assignment {
  uuid: string;
  vss_user_id: string | number;
  coverage_area_id: string | number;
  assignment_date: string;
  status?: Status | string;
  coverage_area_name?: string;
  coverage_area?: { uuid: string; name?: string; coverage_area_name?: string };
  vss_user?: { uuid: string; first_name?: string; last_name?: string; full_name?: string };
  vss_name?: string;
  // legacy fields for backward compatibility
  team_name?: string;
  segment_name?: string;
  brand_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentPayload {
  vss_user_id: string | number;
  coverage_area_id: string | number;
  assignment_date: string;
}

// legacy enum kept for compatibility but not used in new flow
export enum SamplingType {
  stationary = "stationary",
  mobile = "mobile",
}

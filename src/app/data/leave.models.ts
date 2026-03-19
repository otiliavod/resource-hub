export type LeaveType = 'ANNUAL' | 'PERSONAL' | 'SICK' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveBalance {
  annualAllowance: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequestItem {
  id: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
}

export interface LeaveUpcomingResponse {
  items: LeaveRequestItem[];
}

export interface CreateLeaveRequestPayload {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

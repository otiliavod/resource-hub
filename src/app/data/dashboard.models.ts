export interface DashboardStat {
  label: string;
  value: string;
  hint: string;
  icon?: string;
}

export interface TimesheetSummaryItem {
  day: string;
  hours: number;
  formattedHours: string;
}

export type LeaveStatus = 'approved' | 'pending' | 'rejected';

export interface LeaveItem {
  title: string;
  dateLabel: string;
  status: LeaveStatus;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  recentTimesheets: TimesheetSummaryItem[];
  upcomingLeave: LeaveItem[];
}

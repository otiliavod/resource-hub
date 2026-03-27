import { DashboardSummary } from './dashboard.models';

export const DASHBOARD_MOCK: DashboardSummary = {
  stats: [
    { label: 'Hours This Week', value: '32.5', hint: '+2.5h', icon: 'pi pi-clock' },
    { label: 'Leave Balance', value: '18 days', hint: 'of 25', icon: 'pi pi-calendar' },
    { label: 'Team Members', value: '12', hint: 'Active', icon: 'pi pi-users' },
  ],
  recentTimesheets: [
    { day: 'Mon', hours: 8, formattedHours: '8h' },
    { day: 'Tue', hours: 7.5, formattedHours: '7.5h' },
    { day: 'Wed', hours: 8, formattedHours: '8h' },
    { day: 'Thu', hours: 8.5, formattedHours: '8.5h' },
    { day: 'Fri', hours: 0.5, formattedHours: '0.5h' },
  ],
  upcomingLeave: [
    { title: 'Annual Leave', dateLabel: 'Mar 15–17', status: 'approved' },
    { title: 'Personal Day', dateLabel: 'Apr 2', status: 'pending' },
    { title: 'Annual Leave', dateLabel: 'Apr 18–22', status: 'pending' },
  ],
};

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type DashboardStat = {
  label: string;
  value: string;
  hint: string;
  icon?: string;
};

type TimesheetSummaryItem = {
  day: string;
  hours: number;
  formattedHours: string;
};

type LeaveStatus = 'approved' | 'pending' | 'rejected';

type LeaveItem = {
  title: string;
  dateLabel: string;
  status: LeaveStatus;
};

type DashboardSummary = {
  stats: DashboardStat[];
  recentTimesheets: TimesheetSummaryItem[];
  upcomingLeave: LeaveItem[];
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const startOfWeek = this.getStartOfWeek(new Date());
    const endOfWeek = this.getEndOfWeek(startOfWeek);

    const [timeEntries, activeTeamMembers] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where: {
          userId,
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        select: {
          date: true,
          minutes: true,
        },
        orderBy: {
          date: 'asc',
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'DEV',
        },
      }),
    ]);

    const recentTimesheets = this.buildWeeklyTimesheetSummary(timeEntries);
    const totalWeekHours = recentTimesheets.reduce((sum, item) => sum + item.hours, 0);

    return {
      stats: [
        {
          label: 'Hours This Week',
          value: this.formatNumber(totalWeekHours),
          hint: `${timeEntries.length} entr${timeEntries.length === 1 ? 'y' : 'ies'}`,
          icon: 'pi pi-clock',
        },
        {
          label: 'Leave Balance',
          value: '25 days',
          hint: 'default allowance',
          icon: 'pi pi-calendar',
        },
        {
          label: 'Team Members',
          value: String(activeTeamMembers),
          hint: 'Active',
          icon: 'pi pi-users',
        },
      ],
      recentTimesheets,
      upcomingLeave: [
        {
          title: 'Annual Leave',
          dateLabel: 'Mar 15–17',
          status: 'approved',
        },
        {
          title: 'Personal Day',
          dateLabel: 'Apr 2',
          status: 'pending',
        },
        {
          title: 'Annual Leave',
          dateLabel: 'Apr 18–22',
          status: 'pending',
        },
      ],
    };
  }

  private buildWeeklyTimesheetSummary(
      entries: Array<{ date: Date; minutes: number }>,
  ): TimesheetSummaryItem[] {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayMinutes = [0, 0, 0, 0, 0];

    for (const entry of entries) {
      const dayIndex = this.getWeekdayIndex(entry.date);
      if (dayIndex >= 0 && dayIndex < 5) {
        dayMinutes[dayIndex] += entry.minutes;
      }
    }

    return labels.map((label, index) => {
      const hours = dayMinutes[index] / 60;

      return {
        day: label,
        hours,
        formattedHours: `${this.formatNumber(hours)}h`,
      };
    });
  }

  private getWeekdayIndex(date: Date): number {
    const day = new Date(date).getDay();
    return day === 0 ? 6 : day - 1;
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);

    return result;
  }

  private getEndOfWeek(startOfWeek: Date): Date {
    const result = new Date(startOfWeek);
    result.setDate(result.getDate() + 4);
    result.setHours(23, 59, 59, 999);

    return result;
  }

  private formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
}

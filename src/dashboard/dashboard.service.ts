import { Injectable } from '@nestjs/common';
import { LeaveStatus, LeaveType } from '@prisma/client';

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

type LeaveItem = {
  title: string;
  dateLabel: string;
  status: 'approved' | 'pending' | 'rejected';
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
    const today = this.startOfDay(new Date());

    const [timeEntries, activeTeamMembers, leaveBalance, upcomingLeave] = await Promise.all([
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
      this.prisma.leaveBalance.findUnique({
        where: { userId },
        select: {
          annualAllowance: true,
          usedDays: true,
        },
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          userId,
          endDate: { gte: today },
        },
        orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
        select: {
          type: true,
          status: true,
          startDate: true,
          endDate: true,
        },
        take: 3,
      }),
    ]);

    const recentTimesheets = this.buildWeeklyTimesheetSummary(timeEntries);
    const totalWeekHours = recentTimesheets.reduce((sum, item) => sum + item.hours, 0);

    const annualAllowance = leaveBalance?.annualAllowance ?? 25;
    const usedDays = Number(leaveBalance?.usedDays ?? 0);
    const remainingDays = Math.max(annualAllowance - usedDays, 0);

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
          value: `${this.formatNumber(remainingDays)} days`,
          hint: `${this.formatNumber(usedDays)} used of ${annualAllowance}`,
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
      upcomingLeave: upcomingLeave.map((item) => ({
        title: this.formatLeaveType(item.type),
        dateLabel: this.formatLeaveDateRange(item.startDate, item.endDate),
        status: item.status.toLowerCase() as LeaveItem['status'],
      })),
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

  private formatLeaveType(type: LeaveType): string {
    switch (type) {
      case LeaveType.ANNUAL:
        return 'Annual Leave';
      case LeaveType.PERSONAL:
        return 'Personal Leave';
      case LeaveType.SICK:
        return 'Sick Leave';
      case LeaveType.UNPAID:
        return 'Unpaid Leave';
      default:
        return 'Leave';
    }
  }

  private formatLeaveDateRange(startDate: Date, endDate: Date): string {
    const sameDay = startDate.getTime() === endDate.getTime();

    const startLabel = this.formatShortDate(startDate);
    const endLabel = this.formatShortDate(endDate);

    return sameDay ? startLabel : `${startLabel}–${endLabel}`;
  }

  private formatShortDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
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

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
}

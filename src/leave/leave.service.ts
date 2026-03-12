import { BadRequestException, Injectable } from '@nestjs/common';
import { LeaveStatus, LeaveType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { userId },
      select: {
        annualAllowance: true,
        usedDays: true,
      },
    });

    if (!balance) {
      return {
        annualAllowance: 25,
        usedDays: 0,
        remainingDays: 25,
      };
    }

    const annualAllowance = balance.annualAllowance;
    const usedDays = Number(balance.usedDays);
    const remainingDays = Math.max(annualAllowance - usedDays, 0);

    return {
      annualAllowance,
      usedDays,
      remainingDays,
    };
  }

  async getUpcoming(userId: string) {
    const today = this.startOfDay(new Date());

    const items = await this.prisma.leaveRequest.findMany({
      where: {
        userId,
        endDate: { gte: today },
      },
      orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        daysCount: true,
        reason: true,
      },
      take: 10,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        status: item.status,
        startDate: item.startDate.toISOString(),
        endDate: item.endDate.toISOString(),
        daysCount: Number(item.daysCount),
        reason: item.reason,
      })),
    };
  }

  async createRequest(userId: string, dto: CreateLeaveRequestDto) {
    const startDate = this.startOfDay(new Date(dto.startDate));
    const endDate = this.startOfDay(new Date(dto.endDate));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid leave dates.');
    }

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    const daysCount = this.calculateInclusiveDays(startDate, endDate);

    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
        },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: { id: true },
    });

    if (overlapping) {
      throw new BadRequestException('You already have a pending or approved leave request in this period.');
    }

    const created = await this.prisma.leaveRequest.create({
      data: {
        userId,
        type: dto.type as LeaveType,
        status: LeaveStatus.PENDING,
        startDate,
        endDate,
        daysCount,
        reason: dto.reason?.trim() || null,
      },
      select: {
        id: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        daysCount: true,
        reason: true,
      },
    });

    return {
      id: created.id,
      type: created.type,
      status: created.status,
      startDate: created.startDate.toISOString(),
      endDate: created.endDate.toISOString(),
      daysCount: Number(created.daysCount),
      reason: created.reason,
    };
  }

  private startOfDay(date: Date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private calculateInclusiveDays(startDate: Date, endDate: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return (endDate.getTime() - startDate.getTime()) / msPerDay + 1;
  }
}

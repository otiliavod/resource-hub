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

  async updateRequest(userId: string, requestId: string, dto: CreateLeaveRequestDto) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing || existing.userId !== userId) {
      throw new BadRequestException('Leave request not found.');
    }

    if (existing.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be edited.');
    }

    const startDate = this.startOfDay(new Date(dto.startDate));
    const endDate = this.startOfDay(new Date(dto.endDate));

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    const daysCount = this.calculateInclusiveDays(startDate, endDate);

    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        type: dto.type as LeaveType,
        startDate,
        endDate,
        daysCount,
        reason: dto.reason?.trim() || null,
      },
    });

    return {
      id: updated.id,
      type: updated.type,
      status: updated.status,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      daysCount: Number(updated.daysCount),
      reason: updated.reason,
    };
  }

  async deleteRequest(userId: string, requestId: string) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!existing || existing.userId !== userId) {
      throw new BadRequestException('Leave request not found.');
    }

    if (existing.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending leave requests can be deleted.');
    }

    await this.prisma.leaveRequest.delete({
      where: { id: requestId },
    });

    return { ok: true };
  }
}

import { LeaveType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeaveRequestDto {
    @IsEnum(LeaveType, { message: 'Leave type is invalid.' })
    type!: LeaveType;

    @IsDateString({}, { message: 'Start date must be a valid ISO date string.' })
    startDate!: string;

    @IsDateString({}, { message: 'End date must be a valid ISO date string.' })
    endDate!: string;

    @IsOptional()
    @IsString({ message: 'Reason must be a string.' })
    @MaxLength(500, { message: 'Reason must be at most 500 characters long.' })
    reason?: string;
}

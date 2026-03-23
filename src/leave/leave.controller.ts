import {Body, Controller, Delete, Get, Param, Patch, Post, UnauthorizedException, UseGuards} from '@nestjs/common';

import { LeaveService } from './leave.service';
import { AccessJwtGuard } from '../auth/guards/access-jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Controller('leave')
@UseGuards(AccessJwtGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('balance')
  getBalance(@CurrentUser() user: JwtPayload) {
    return this.leaveService.getBalance(user.sub);
  }

  @Get('upcoming')
  getUpcoming(@CurrentUser() user: JwtPayload) {
    return this.leaveService.getUpcoming(user.sub);
  }

  @Post('request')
  createRequest(
      @CurrentUser() user: JwtPayload,
      @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.createRequest(user.sub, dto);
  }

  @Patch(':id')
  updateRequest(
      @CurrentUser() user: JwtPayload,
      @Param('id') id: string,
      @Body() dto: CreateLeaveRequestDto,
  ) {
    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    return this.leaveService.updateRequest(user.sub, id, dto);
  }

  @Delete(':id')
  deleteRequest(
      @CurrentUser() user: JwtPayload,
      @Param('id') id: string,
  ) {
    return this.leaveService.deleteRequest(user.sub, id);
  }
}

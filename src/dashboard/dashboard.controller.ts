import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { AccessJwtGuard } from '../auth/guards/access-jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Controller('dashboard')
@UseGuards(AccessJwtGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('summary')
    getSummary(@CurrentUser() user: JwtPayload) {
        return this.dashboardService.getSummary(user.sub);
    }
}

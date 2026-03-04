import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request,Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { CurrentUser } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto.email, dto.password);
    res.cookie('rt', refreshToken, this.auth['refreshCookieOptions']());
    return { accessToken, user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = (req.cookies?.rt as string | undefined) ?? null;
    if (!rt) return { accessToken: null };

    const { accessToken, refreshToken } = await this.auth.refresh(rt);
    res.cookie('rt', refreshToken, this.auth['refreshCookieOptions']());
    return { accessToken };
  }

  @UseGuards(AccessJwtGuard)
  @Post('logout')
  async logout(@CurrentUser() user: { sub: string }, @Res({ passthrough: true }) res: Response) {
    await this.auth.logoutAll(user.sub);
    res.clearCookie('rt', { path: '/auth/refresh' });
    return { ok: true };
  }

  @UseGuards(AccessJwtGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return { user };
  }
}


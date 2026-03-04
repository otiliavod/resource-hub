import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { JwtPayload } from './types/jwt-payload';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private accessTtl(): StringValue | number {
    return (this.config.get('JWT_ACCESS_TTL') ?? '15m') as StringValue;
  }

  private refreshTtl(): StringValue | number {
    return (this.config.get('JWT_REFRESH_TTL') ?? '7d') as StringValue;
  }

  private async signAccessToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.accessTtl(),
    });
  }

  private async signRefreshToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTtl(),
    });
  }

  private refreshCookieOptions() {
    const secure = (this.config.get<string>('COOKIE_SECURE') ?? 'false') === 'true';
    const domain = this.config.get<string>('COOKIE_DOMAIN') ?? undefined;

    return {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/auth/refresh',
      domain: domain || undefined,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role as Role };
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Store refresh token hash
    const expiresAt = this.computeRefreshExpiryDate();
    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find non-revoked tokens for user and compare hashes
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const match = await this.findMatchingToken(tokens.map(t => ({ id: t.id, hash: t.tokenHash })), refreshToken);
    if (!match) throw new UnauthorizedException('Refresh token not recognized');

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: match },
      data: { revokedAt: new Date() },
    });

    const newPayload: JwtPayload = payload;
    const newAccessToken = await this.signAccessToken(newPayload);
    const newRefreshToken = await this.signRefreshToken(newPayload);
    const newHash = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.refreshToken.create({
      data: { userId: payload.sub, tokenHash: newHash, expiresAt: this.computeRefreshExpiryDate() },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private computeRefreshExpiryDate() {
    // Simple approach: 7 days default if you keep JWT_REFRESH_TTL="7d"
    // (You can parse ttl precisely later; this is fine if you treat DB as secondary.)
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }

  private async findMatchingToken(
    candidates: Array<{ id: string; hash: string }>,
    token: string,
  ): Promise<string | null> {
    for (const c of candidates) {
      const ok = await bcrypt.compare(token, c.hash);
      if (ok) return c.id;
    }
    return null;
  }
}

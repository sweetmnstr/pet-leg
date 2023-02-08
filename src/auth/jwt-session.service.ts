import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshSession } from './refresh-session.entity';
import { addDays } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { ValidateRefreshSessionDto } from './dto/validate-refresh-session.dto';
import { CustomerService } from '../customer/customer.service';
import { UserService } from '../user/user.service';
import { JwtSignatureDTO } from './dto/jwt-signature.dto';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';

@Injectable()
export class JWTSessionService {
  constructor(
    @InjectRepository(RefreshSession)
    private refreshSessionRepository: Repository<RefreshSession>,
    private jwtService: JwtService,
    private customerService: CustomerService,
    private userService: UserService,
  ) {}
  async isValidUserRefreshSessionsCount(userId: number): Promise<boolean> {
    const existingRefreshSessionsCount =
      await this.refreshSessionRepository.count({ where: { userId } });

    return (
      existingRefreshSessionsCount <
      parseInt(process.env.MAX_REFRESH_SESSIONS_COUNT)
    );
  }

  async wipeUserRefreshSessions(userId: number): Promise<void> {
    await this.refreshSessionRepository.delete({ userId });
  }

  async invalidateRefreshSession(refreshToken: string): Promise<void> {
    await this.refreshSessionRepository.delete({ refreshToken });
  }

  async createRefreshSessionAndGetRefreshToken(
    refreshSessionBase: RefreshSessionDto,
  ): Promise<string> {
    if (
      !(await this.isValidUserRefreshSessionsCount(refreshSessionBase.userId))
    ) {
      await this.wipeUserRefreshSessions(refreshSessionBase.userId);
    }

    const refreshToken = uuid();

    await this.refreshSessionRepository.insert({
      ...refreshSessionBase,
      refreshToken,
      expiresIn: addDays(
        new Date(),
        parseInt(process.env.JWT_SESSION_LIFETIME_DAYS),
      )
        .getMilliseconds()
        .toString(),
    });

    return refreshToken;
  }

  async validateRefreshSession(refreshSession: ValidateRefreshSessionDto) {
    const storeRefreshSession = await this.refreshSessionRepository.findOne({
      where: { refreshToken: refreshSession.refreshToken },
    });

    if (
      !storeRefreshSession ||
      refreshSession.ip !== storeRefreshSession.ip ||
      refreshSession.fingerprint !== storeRefreshSession.fingerprint
    ) {
      throw new BadRequestException('INVALID_REFRESH_SESSION');
    }
  }

  async getAccessToken(
    refreshSession: ValidateRefreshSessionDto,
  ): Promise<string> {
    const { refreshToken } = refreshSession;

    await this.validateRefreshSession(refreshSession);

    const userRefreshSession = await this.refreshSessionRepository.findOne({
      where: { refreshToken },
    });

    const customerJWTSignature = await this.getUserJWTSignature(
      userRefreshSession.userId,
    );

    const signOptions = {
      expiresIn: refreshSession.isRegistrationSession
        ? '60d'
        : process.env.JWT_LIFETIME,
    } as JwtSignOptions;

    return this.jwtService.sign(customerJWTSignature, signOptions);
  }

  async getUserJWTSignature(userId: number): Promise<JwtSignatureDTO> {
    const user = await this.userService.findOne({
      where: { id: userId },
      relations: { customer: true, lawyer: true },
    });

    return {
      id: userId,
      customerId: user.customer?.id,
      lawyerId: user.lawyer?.id,
      email: user.email,
      roles: user.roles,
      twilioIdentitySid: user.twilioIdentitySid,
    };
  }

  async parseAccessToken(accessToken: string): Promise<JwtSignatureDTO> {
    return this.jwtService.decode(accessToken, {
      json: true,
    }) as JwtSignatureDTO;
  }

  async getUserIdByRefreshToken(refreshToken: string): Promise<number> {
    if (!refreshToken) return null;

    const refreshSession = await this.refreshSessionRepository.findOne({
      where: { refreshToken },
    });

    if (!refreshSession) return null;

    return refreshSession.userId;
  }
}

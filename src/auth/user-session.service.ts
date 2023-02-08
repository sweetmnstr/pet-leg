import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IORedisKey } from '../redis/redis.module';
import { UserRoles } from '../user/enums/user-roles.enum';

@Injectable()
export class UserSessionService {
  constructor(
    @Inject(IORedisKey)
    private readonly redisCache,
  ) {}

  async registerUserSession(
    userId: number,
    role: UserRoles,
    sid: string,
  ): Promise<void> {
    await this.redisCache.set(`${role}_session_${userId}`, sid, {
      ttl: +process.env.USER_SESSION_TTL || 300,
    });
  }

  async validateUserSession(
    userRoleId: number,
    role: UserRoles,
    sid: string,
  ): Promise<void> {
    const userSession = await this.redisCache.get(
      `${role}_session_${userRoleId}`,
    );

    if (!userSession || userSession !== sid) {
      await this.invalidateUserSession(userRoleId, role);
      throw new BadRequestException('INVALID_USER_SESSION');
    }
  }

  async refreshUserSession(userRoleId: number, role: UserRoles): Promise<void> {
    const session = await this.redisCache.get(`${role}_session_${userRoleId}`);

    await this.redisCache.set(`${role}_session_${userRoleId}`, session, {
      ttl: +process.env.USER_SESSION_TTL || 300,
    });
  }

  async invalidateUserSession(userId: number, role: UserRoles): Promise<void> {
    await this.redisCache.del(`${role}_session_${userId}`);
  }

  async describeUserSession(userId: number, role: UserRoles): Promise<boolean> {
    return !!(await this.redisCache.get(`${role}_session_${userId}`));
  }

  async describeRoleSessions(
    userIds: number[],
    role: UserRoles,
  ): Promise<Record<string, number | boolean>[]> {
    return Promise.all(
      userIds.map(async (userRoleId) => {
        const isActive = await this.describeUserSession(userRoleId, role);
        return {
          [`${role}Id`]: userRoleId,
          isActive,
        };
      }),
    );
  }
}

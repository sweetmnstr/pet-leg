import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { CustomerService } from '../customer/customer.service';
import { GetCustomerProfileDTO } from '../customer/dto/get-customer-profile.dto';
import { LawyerProfileDto } from '../lawyer/dto/lawyer-profile.dto';
import { UserRoles } from '../user/enums/user-roles.enum';
import { LawyerService } from '../lawyer/lawyer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshSession } from './refresh-session.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { AuthenticateDto } from './dto/authenticate.dto';
import { JWTSessionService } from './jwt-session.service';
import { SignUpDTO } from './dto/sign-up.dto';
import { Customer } from '../customer/customer.entity';
import { UserSessionService } from './user-session.service';
import { Request } from 'express-serve-static-core';
import { AuthStrategiesConfig } from './config/auth-strategies.config';
import { AuthStrategiesEnum } from './types/auth-strategies.enum';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { Lawyer } from '../lawyer/entities/lawyer.entity';
import { NotificationFiltersService } from '../notification-filters/notification-filters.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class AuthService {
  logger: Logger = new Logger('AuthService');

  constructor(
    @InjectRepository(RefreshSession)
    private refreshSessionRepository: Repository<RefreshSession>,
    private jwtSessionService: JWTSessionService,
    private userService: UserService,
    private lawyerService: LawyerService,
    private jwtService: JwtService,
    private userSessionService: UserSessionService,
    private customerService: CustomerService,
    private notificationFiltersService: NotificationFiltersService,
    private chatService: ChatService,
  ) {}

  static async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async validateUser(signInDto: SignInDto): Promise<void> {
    const { email, password } = signInDto;
    const user = await this.userService.getUserWithPassword(email);

    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      throw new BadRequestException('INVALID_PASSWORD');
    }
  }

  public async signIn(
    signInDto: SignInDto,
    fingerprint: string,
    ip: string,
    ua: string,
    isSessionAuth: boolean,
  ): Promise<AuthenticateDto> {
    await this.validateUser(signInDto);

    return this.getUserWithTokens(
      signInDto.email,
      fingerprint,
      ip,
      ua,
      isSessionAuth,
      signInDto.roles,
    );
  }

  public async getUserWithTokens(
    email: string,
    fingerprint: string,
    ip: string,
    ua: string,
    isSessionAuth: boolean,
    roles: UserRoles,
  ) {
    const userProfile = (await this.getUserProfile({
      email,
    })) as GetCustomerProfileDTO;

    const refreshToken =
      await this.jwtSessionService.createRefreshSessionAndGetRefreshToken({
        userId: userProfile.userId,
        fingerprint,
        ip,
        ua,
      });

    const accessToken = await this.jwtSessionService.getAccessToken({
      refreshToken,
      fingerprint,
      ip,
    });

    if (isSessionAuth) {
      await this.userSessionService.registerUserSession(
        userProfile.id,
        roles,
        fingerprint,
      );
    }

    return {
      accessToken,
      refreshToken,
      user: userProfile,
    };
  }

  public async isRegistrationSession(
    roles: UserRoles,
    email: string,
  ): Promise<boolean> {
    const user = await this.userService.findOne({
      where: { email },
      relations: { customer: true, lawyer: true },
    });

    switch (roles) {
      case UserRoles.Lawyer:
        return !user.lawyer.isVerified;
      default:
        return false;
    }
  }

  public async customerSignUp(
    signUpDto: SignUpDTO,
    fingerprint: string,
    ip: string,
    ua: string,
  ): Promise<AuthenticateDto> {
    let customer;

    customer = await this.validateUserAndBoundCustomer(signUpDto);

    const user = await this.registerUser(signUpDto, UserRoles.Customer);

    if (!customer) {
      customer = (await this.customerService.createCustomer({
        ...signUpDto,
        user,
      })) as Customer;
    }

    const refreshToken =
      await this.jwtSessionService.createRefreshSessionAndGetRefreshToken({
        userId: user.id,
        fingerprint,
        ip,
        ua,
      });

    return {
      refreshToken,
      user: {
        ...customer,
        userId: user.id,
      },
    };
  }

  public async lawyerSignUp(
    signUpDto: SignUpDTO,
    fingerprint: string,
    ip: string,
    ua: string,
  ): Promise<AuthenticateDto> {
    await this.validateUserSignUp(signUpDto);

    const user = await this.registerUser(signUpDto, UserRoles.Lawyer);

    const lawyer = (await this.lawyerService.createLawyer({
      ...signUpDto,
      user,
    })) as Lawyer;

    const refreshToken =
      await this.jwtSessionService.createRefreshSessionAndGetRefreshToken({
        userId: user.id,
        fingerprint,
        ip,
        ua,
      });

    const accessToken = await this.jwtSessionService.getAccessToken({
      refreshToken,
      fingerprint,
      ip,
    });

    await this.userSessionService.registerUserSession(
      user.id,
      UserRoles.Lawyer,
      fingerprint,
    );

    return {
      accessToken,
      refreshToken,
      user: lawyer,
    };
  }

  public async getUserProfile(
    matchOptions: FindOptionsWhere<User>,
  ): Promise<GetCustomerProfileDTO | LawyerProfileDto> {
    const user = await this.userService.findOne({
      where: matchOptions,
      relations: { customer: true, lawyer: true },
    });

    if (!user) {
      throw new BadRequestException('USER_NOT_EXISTS');
    }

    let userProfile;

    switch (user.roles) {
      case UserRoles.Customer:
        userProfile = await this.customerService.getCustomerProfile(
          user.customer.id,
        );
        break;
      case UserRoles.Lawyer:
        userProfile = await this.lawyerService.getLawyerProfile({
          ...user.lawyer,
          user,
        });
        break;
      default:
        return null;
    }

    return {
      ...userProfile,
      userId: user.id,
    };
  }

  private async registerUser(signUpDto: SignUpDTO, roles) {
    const { email, password } = signUpDto;

    const hashedPassword = await AuthService.encryptPassword(password);

    const notificationFilters =
      await this.notificationFiltersService.createUserNotificationFilters();

    await this.userService.createUser({
      email,
      password: hashedPassword,
      firstName: signUpDto.firstName,
      lastName: signUpDto.lastName,
      roles,
      notificationFilters,
    });

    return this.userService.findOne({ where: { email } });
  }

  async extractMetadataFromRequest(req: Request): Promise<{
    fingerprint: string;
    ip: string;
    ua: string;
    refreshToken: string;
  }> {
    const fingerprint = req.headers['x-fp'] as string;
    const ip = req.ip;
    const ua = req.get('User-Agent');

    if (!fingerprint) {
      throw new BadRequestException('BROWSER_FINGERPRINT_NOT_PROVIDED');
    }

    const refreshToken = req.cookies['refresh_token'];

    return {
      fingerprint,
      ip,
      ua,
      refreshToken,
    };
  }

  private async validateUserSignUp(signUpDto: SignUpDTO): Promise<void> {
    const user = await this.userService.findOne({
      where: { email: signUpDto.email },
    });

    if (!!user) {
      throw new BadRequestException('USER_ALREADY_EXIST');
    }
  }

  private async validateUserAndBoundCustomer(
    signUpDto: SignUpDTO,
  ): Promise<GetCustomerProfileDTO> {
    const user = await this.userService.findOne({
      where: { email: signUpDto.email },
    });

    if (!!user) {
      const isLawyer = await this.lawyerService.matchLawyerByUserId(user.id);

      if (isLawyer) {
        await this.customerService.createCustomer({
          ...signUpDto,
          user,
        });
        return this.customerService.getCustomerProfile(user.customer.id);
      }
      throw new BadRequestException('USER_ALREADY_EXIST');
    }
  }

  // TODO
  // async signOnGoogleUser(email: string) {
  //   const user = await this.userService.findOne({ where: { email } });
  //
  //   let verifiedUser;
  //
  //   if (!user) {
  //     verifiedUser = await this.userService.createSocialLoginUser(email,.)
  //   }
  //
  //   if (user.authType !== AuthType.GOOGLE) {
  //     throw new BadRequestException('INVALID_AUTH_TYPE');
  //   }
  // }

  async getUserDataFromSocials(email: string, req) {
    const { fingerprint, ip, ua } = await this.extractMetadataFromRequest(req);

    const user = await this.userService.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('INVALID_USER');
    }
    const isSessionAuth =
      AuthStrategiesConfig[user.roles] === AuthStrategiesEnum.SESSION;
    return this.getUserWithTokens(
      email,
      fingerprint,
      ip,
      ua,
      isSessionAuth,
      user.roles,
    );
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO): Promise<boolean> {
    await this.userService.updatePassword(
      resetPasswordDTO.userId,
      resetPasswordDTO.password,
    );

    return true;
  }

  async addTwilioIdToUser(userId: number): Promise<void> {
    const user = await this.userService.getUser(userId);

    if (user.twilioIdentitySid) return;

    try {
      const { sid, identity } = await this.chatService.createConversationUser(
        userId,
      );

      await this.userService.updateUser(userId, {
        twilioIdentitySid: identity,
        twilioUserSid: sid,
      });
    } catch (e) {
      this.logger.error(e.toString());
    }
  }
}

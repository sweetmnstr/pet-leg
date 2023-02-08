import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { JWTTokenDto } from './dto/jwt-token.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { JWTSessionService } from './jwt-session.service';
import { Request, Response } from 'express-serve-static-core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthStrategiesConfig } from './config/auth-strategies.config';
import { AuthStrategiesEnum } from './types/auth-strategies.enum';
import { UserSessionService } from './user-session.service';
import { JwtSignatureDTO } from './dto/jwt-signature.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRoles } from '../user/enums/user-roles.enum';
import { RolesGuard } from './guards/roles.guard';
import { DescribeLawyerSessionsDto } from './dto/describe-lawyer-sessions.dto';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { GetCustomerProfileDTO } from '../customer/dto/get-customer-profile.dto';
import { LawyerProfileDto } from '../lawyer/dto/lawyer-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtSessionService: JWTSessionService,
    private userSessionService: UserSessionService,
    private jwtService: JwtService,
  ) {}
  @Post('customer-sign-up')
  async signUp(
    @Req() req: Request,
    @Body() signUpDto: SignUpDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<JWTTokenDto> {
    const { fingerprint, ip, ua } =
      await this.authService.extractMetadataFromRequest(req);

    const { refreshToken: refresh_token, user } =
      await this.authService.customerSignUp(signUpDto, fingerprint, ip, ua);

    const { userId } = user as GetCustomerProfileDTO | LawyerProfileDto;

    await this.authService.addTwilioIdToUser(userId);

    const access_token = await this.jwtSessionService.getAccessToken({
      refreshToken: refresh_token,
      fingerprint,
      ip,
    });

    response.cookie('refresh_token', refresh_token);

    return {
      access_token,
      user,
    };
  }

  @Post('lawyer-sign-up')
  async lawyerSignUp(
    @Req() req: Request,
    @Body() signUpDto: SignUpDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<JWTTokenDto> {
    const { fingerprint, ip, ua } =
      await this.authService.extractMetadataFromRequest(req);

    const { refreshToken: refresh_token, user } =
      await this.authService.lawyerSignUp(signUpDto, fingerprint, ip, ua);

    const { userId } = user as GetCustomerProfileDTO | LawyerProfileDto;

    await this.authService.addTwilioIdToUser(userId);

    const access_token = await this.jwtSessionService.getAccessToken({
      refreshToken: refresh_token,
      fingerprint,
      ip,
      isRegistrationSession: true,
    });

    response.cookie('refresh_token', refresh_token);

    return {
      access_token,
      user,
    };
  }

  @HttpCode(200)
  @Post('sign-in')
  async signIn(
    @Req() req: Request,
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<JWTTokenDto> {
    const { fingerprint, ip, ua } =
      await this.authService.extractMetadataFromRequest(req);

    const isSessionAuth =
      AuthStrategiesConfig[signInDto.roles] === AuthStrategiesEnum.SESSION;

    const {
      accessToken: access_token,
      refreshToken: refresh_token,
      user,
    } = await this.authService.signIn(
      signInDto,
      fingerprint,
      ip,
      ua,
      isSessionAuth,
    );

    const { userId } = user as GetCustomerProfileDTO | LawyerProfileDto;

    await this.authService.addTwilioIdToUser(userId);

    response.cookie('refresh_token', refresh_token);

    return {
      access_token,
      user,
    };
  }

  @Get('get-access-token')
  async getAccessToken(@Req() req: Request): Promise<{ access_token: string }> {
    const { fingerprint, ip, refreshToken } =
      await this.authService.extractMetadataFromRequest(req);

    const access_token = await this.jwtSessionService.getAccessToken({
      refreshToken,
      fingerprint,
      ip,
    });

    const user = await this.jwtSessionService.parseAccessToken(access_token);
    const isSessionAuth =
      AuthStrategiesConfig[user.roles] === AuthStrategiesEnum.SESSION;

    if (isSessionAuth) {
      await this.userSessionService.validateUserSession(
        user[`${user.roles}Id`],
        user.roles,
        fingerprint,
      );

      await this.userSessionService.refreshUserSession(
        user[`${user.roles}Id`],
        user.roles,
      );
    }

    return {
      access_token,
    };
  }

  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { refreshToken } = await this.authService.extractMetadataFromRequest(
      req,
    );

    await this.jwtSessionService.invalidateRefreshSession(refreshToken);

    response.cookie('refresh_token', null);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('invalidate-user-session')
  async invalidateUserSession(@Req() req: Request) {
    const user = req.user as JwtSignatureDTO;

    await this.userSessionService.invalidateUserSession(user.id, user.roles);
  }

  @Get('session-ping')
  @UseGuards(JwtAuthGuard)
  async sessionPing(@Req() req: Request): Promise<{
    user: GetCustomerProfileDTO | LawyerProfileDto;
  }> {
    const { fingerprint } = await this.authService.extractMetadataFromRequest(
      req,
    );
    const user = req.user as JwtSignatureDTO;

    await this.userSessionService.validateUserSession(
      user[`${user.roles}Id`],
      user.roles,
      fingerprint,
    );

    const userProfile = await this.authService.getUserProfile({ id: +user.id });

    return { user: userProfile };
  }

  @Get('ping')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  ping(): void {
    return;
  }

  @Get('describe-lawyers-sessions')
  async describeLawyerSessions(
    @Query() describeLawyerSessions: DescribeLawyerSessionsDto,
  ): Promise<Record<string, number | boolean>[]> {
    return this.userSessionService.describeRoleSessions(
      describeLawyerSessions.lawyerIds,
      UserRoles.Lawyer,
    );
  }

  @Get('describe-lawyer-session')
  async describeLawyerSession(
    @Query('lawyerId') lawyerId: number,
  ): Promise<{ lawyerId: number; isActive: boolean }> {
    return {
      lawyerId: lawyerId,
      isActive: await this.userSessionService.describeUserSession(
        lawyerId,
        UserRoles.Lawyer,
      ),
    };
  }

  @HttpCode(200)
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin(): Promise<any> {
    return true;
  }

  @HttpCode(200)
  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginRedirect(@Req() req): Promise<any> {
    return this.authService.getUserDataFromSocials(req.user.email, req);
  }

  @HttpCode(200)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    return true;
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.getUserDataFromSocials(req.user.email, req);
  }

  @HttpCode(200)
  @Get('apple')
  @UseGuards(AppleAuthGuard)
  async appleAuth(): Promise<any> {
    return true;
  }

  @HttpCode(200)
  @Post('apple/redirect')
  async appleAuthRedirect(@Body() payload, @Req() req): Promise<any> {
    if (payload.id_token) {
      const decodedObj = await this.jwtService.decode(payload.id_token);
      const email = decodedObj['email'];
      return this.authService.getUserDataFromSocials(email, req);
    }
    throw new UnauthorizedException('UNAUTHORIZE');
  }

  @Patch('reset-password')
  resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDTO);
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { Request } from './request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoles } from '../user/enums/user-roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtSignatureDTO } from '../auth/dto/jwt-signature.dto';
import { GetUserRequestsDto } from './dto/get-user-requests.dto';
import { CreateAskQuestionRequestDto } from './dto/create-ask-question-request.dto';

@Controller('request')
export class RequestController {
  constructor(public service: RequestService) {}

  @Post('create-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Lawyer, UserRoles.Customer)
  async createRequest(
    @Req() req: Express.Request,
    @Body() createRequest: CreateRequestDto,
  ): Promise<Request> {
    const user = req.user as JwtSignatureDTO;

    return this.service.createRequest(user.id, createRequest);
  }

  @Post('create-ask-question-request')
  createAskQuestionRequest(
    @Body() createAskQuestionRequest: CreateAskQuestionRequestDto,
  ): Promise<Request> {
    return this.service.createAskQuestionRequest(createAskQuestionRequest);
  }

  @Get('get-user-registration-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Lawyer)
  async getUserRegistrationRequest(
    @Req() req: Express.Request,
  ): Promise<Request> {
    const user = req.user as JwtSignatureDTO;

    return this.service.getUserRegistrationRequest(user.id);
  }

  @Get('get-user-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Lawyer, UserRoles.Customer)
  getUserRequests(
    @Req() req: Express.Request,
    @Query() getUserRequests: GetUserRequestsDto,
  ): Promise<Request[]> {
    const user = req.user as JwtSignatureDTO;

    return this.service.getUserRequests(user[user.id], getUserRequests);
  }
}

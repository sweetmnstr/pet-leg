import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDTO } from './dto/create-feedback.dto';
import { GetFeedbackDTO } from './dto/get-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/enums/user-roles.enum';
import { JwtSignatureDTO } from '../auth/dto/jwt-signature.dto';
import { LawyerService } from '../lawyer/lawyer.service';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly service: FeedbackService,
    private readonly lawyerService: LawyerService,
  ) {}

  @Get('get-lawyer-feedbacks/:lawyerId')
  @HttpCode(200)
  async getLawyerFeedbacks(
    @Param('lawyerId') lawyerId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    const lawyerExists = await this.service.isLawyerExists(+lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    return await this.service.getLawyerFeedbacks(+lawyerId, { limit, page });
  }

  @Get('get-personal-feedbacks')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPersonalFeedbacks(
    @Req() req: Express.Request,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    const lawyer = req.user as JwtSignatureDTO;

    const lawyerExists = await this.service.isLawyerExists(+lawyer.lawyerId);
    if (!lawyerExists) throw new NotFoundException('Lawyer not found');

    const hideFeedbacks = await this.lawyerService.isLawyerFeedbacksHidden(
      +lawyer.lawyerId,
    );

    const feedbacks = await this.service.getLawyerFeedbacks(+lawyer.lawyerId, {
      limit,
      page,
    });

    return {
      feedbacks,
      hideFeedbacks,
    };
  }

  @Post('create-feedback')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDTO,
  ): Promise<GetFeedbackDTO> {
    return await this.service.create(createFeedbackDto);
  }
}

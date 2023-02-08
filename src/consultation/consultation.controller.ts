import {
  Controller,
  HttpCode,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationRequestDTO } from './dto/create-consultation-request.dto';
import { GetConsultaionDTO } from './dto/get-constultation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/enums/user-roles.enum';
import { RescheduleDTO } from './dto/reschedule.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post('create-consultation-request')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  async createConsultationRequest(
    @Body() createConsultationRequest: CreateConsultationRequestDTO,
  ): Promise<GetConsultaionDTO> {
    return await this.consultationService.createRequest(
      createConsultationRequest,
    );
  }

  @Post('reject-consultation')
  @Roles(UserRoles.Lawyer, UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async rejectConsultation(
    @Body('consultationId') consultationId: number,
  ): Promise<void> {
    return await this.consultationService.reject(consultationId);
  }

  @Post('approve-consultation')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async approveConsultation(
    @Body('consultationId') consultationId: number,
  ): Promise<void> {
    await this.consultationService.approve(+consultationId);
  }

  @Post('complete-consultation')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async completeConsultation(
    @Body('consultationId') consultationId: number,
  ): Promise<void> {
    await this.consultationService.complete(+consultationId);
  }

  @Patch('reschedule')
  @Roles(UserRoles.Customer, UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async reschedule(@Body() reschedule: RescheduleDTO): Promise<boolean> {
    const rescheduleResponse = await this.consultationService.reschedule(
      reschedule,
    );
    await this.consultationService.rejectOutdatedConsultation(reschedule);
    return rescheduleResponse;
  }

  @Post('reviewed-consultation')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async reviewedConsultation(
    @Body('consultationId') consultationId: number,
    @Body('feedbackId') feedbackId: number,
    @Request() req,
  ): Promise<void> {
    const { customerId } = req.user;
    await this.consultationService.reviewed(
      +consultationId,
      +feedbackId,
      +customerId,
    );
  }

  @Post('send-message-to-lawyer')
  @Roles(UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async sendMessage(@Request() req, @Body() sendMessage: SendMessageDto) {
    const { customerId } = req.user;

    await this.consultationService.sendMessageToLawyer(sendMessage, customerId);
  }
}

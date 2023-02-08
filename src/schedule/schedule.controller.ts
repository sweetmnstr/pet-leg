import {
  Body,
  Controller,
  Get,
  HttpCode,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Schedule } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';
import { GetLawyerScheduleDTO } from './dto/get-lawyer-schedule.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/user/enums/user-roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AvailabilityDTO } from './dto/available.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('get-lawyer-schedule')
  @HttpCode(200)
  getLawyerSchedule(
    @Query() query: GetLawyerScheduleDTO,
  ): Promise<Schedule | { timeslots: [] }> {
    return this.scheduleService.getLawyerSchedule(query);
  }

  @Put('update-lawyer-settings')
  @Roles(UserRoles.Lawyer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  setLawyerAvailability(
    @Request() req,
    @Body() availabilityDTO: AvailabilityDTO,
  ): Promise<boolean> {
    const { lawyerId } = req.user;
    return this.scheduleService.setLawyerAvailability(
      lawyerId,
      availabilityDTO,
    );
  }
}

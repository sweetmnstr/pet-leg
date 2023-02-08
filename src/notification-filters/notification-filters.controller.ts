import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  Patch,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationFiltersService } from './notification-filters.service';
import { NotificationFilters } from './notification-filters.entity';
import { UpdateUserNotificationFiltersDTO } from './dto/update-user-notification-filters.dto';

@Controller('notification-filters')
export class NotificationFiltersController {
  constructor(public service: NotificationFiltersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @Get('get-user-notification-filters')
  getUserNotificationFilters(@Request() req): Promise<NotificationFilters> {
    const { id } = req.user;
    return this.service.getUserNotificationFilters(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  @Patch('update-user-notification-filters/:userId')
  async updateUserNotificationFilters(
    @Param('userId') userId: string,
    @Body() updateNotificationFiltersDTO: UpdateUserNotificationFiltersDTO,
  ): Promise<void> {
    await this.service.updateUserNotificationFilters(
      +userId,
      updateNotificationFiltersDTO,
    );
  }
}

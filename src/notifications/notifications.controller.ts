import { Body, Controller, Post } from '@nestjs/common';
import { SendEmailDTO } from './dto/send-email.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('email')
  async postEmail(@Body() sendEmailDto: SendEmailDTO) {
    return this.notificationsService.sendMessage(sendEmailDto);
  }
}

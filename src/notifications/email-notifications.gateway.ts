import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SendEmailDTO } from './dto/send-email.dto';
import { NotificationsService } from './notifications.service';

const EMAIL_GATEWAY_PORT = +process.env.EMAIL_GATEWAY_PORT;

@WebSocketGateway(EMAIL_GATEWAY_PORT, { namespace: 'emails' })
export class EmailNotificationsGateway {
  constructor(private notificationsService: NotificationsService) {}
  @SubscribeMessage('send-email-notification')
  async handleMessage(@MessageBody() sendEmailDto: SendEmailDTO) {
    const response = this.notificationsService.sendMessage(sendEmailDto);
    return response;
  }
}

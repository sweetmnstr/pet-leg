import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { CreatePushNotificationDTO } from './dto/create-push-notification.dto';
import { NotificationsService } from './notifications.service';

const NOTIFACTIONS_GATEWAY_PORT = +process.env.NOTIFACTIONS_GATEWAY_PORT;

@WebSocketGateway(NOTIFACTIONS_GATEWAY_PORT, { namespace: 'notifications' })
export class NotificationGateway {
  constructor(private notificationsService: NotificationsService) {}

  @SubscribeMessage('create-push-notification')
  async createPushNotification(
    @MessageBody() message: CreatePushNotificationDTO,
  ) {
    return this.notificationsService.createNotification(message);
  }

  @SubscribeMessage('get-notification')
  async getNotifications(@MessageBody('userId') userId: number) {
    return this.notificationsService.getNotifications(userId);
  }
}

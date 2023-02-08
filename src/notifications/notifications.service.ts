import { Inject, Injectable } from '@nestjs/common';
import { Channel, RabbitMQ } from '../rabbitmq/rabbitmq-client.module';
import { v4 as uuidv4 } from 'uuid';
import { CreatePushNotificationDTO } from './dto/create-push-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notifications.entity';
import * as moment from 'moment';
import { SendEmailDTO } from './dto/send-email.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(RabbitMQ) private readonly channel: Channel,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private userService: UserService,
  ) {}

  async sendMessage(sendEmailDto: SendEmailDTO) {
    return new Promise((resolve) => {
      const correlationId = uuidv4();
      this.channel.responseEmitter.once(correlationId, resolve);
      this.channel.sendToQueue(
        process.env.RABBITMQ_QUEUE,
        Buffer.from(JSON.stringify(sendEmailDto)),
        {
          correlationId,
          replyTo: process.env.RABBITMQ_REPLY_QUEUE,
        },
      );
    });
  }

  async createNotification(createPushNotification: CreatePushNotificationDTO) {
    const user = await this.userService.findOne({
      where: { id: createPushNotification.userId },
    });
    await this.notificationRepository.insert({
      ...createPushNotification,
      expiredAt: moment().add(2, 'weeks').format(),
      user,
    });
    return true;
  }

  async getNotifications(userId: number) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
    });
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { rabbitMQModule } from '../rabbitmq/rabbitmq-client.config';
import { EmailNotificationsGateway } from './email-notifications.gateway';
import { Notification } from './notifications.entity';
import { NotificationsService } from './notifications.service';
import { NotificationGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    rabbitMQModule,
    TypeOrmModule.forFeature([Notification]),
    UserModule,
  ],
  providers: [
    NotificationsService,
    EmailNotificationsGateway,
    NotificationGateway,
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}

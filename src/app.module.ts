import * as path from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { LawyerModule } from './lawyer/lawyer.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ConsultationModule } from './consultation/consultation.module';
import { FeedbackModule } from './feedback/feedback.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { EntityFileModule } from './entity-file/entity-file.module';
import { SharedLinkModule } from './shared-link/shared-link.module';
import { ChatModule } from './chat/chat.module';
import { FaqModule } from './faq/faq.module';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { NotificationFiltersModule } from './notification-filters/notification-filters.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { RequestModule } from './request/request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      logging: true,
      logger: 'file',
      entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],
      migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
    }),
    UserModule,
    AuthModule,
    CustomerModule,
    LawyerModule,
    ScheduleModule,
    ConsultationModule,
    FeedbackModule,
    FavoriteModule,
    GeolocationModule,
    EntityFileModule,
    SharedLinkModule,
    ChatModule,
    FaqModule,
    PostModule,
    CategoryModule,
    CommentModule,
    NotificationFiltersModule,
    RecommendationsModule,
    RequestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

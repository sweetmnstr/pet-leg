import { Module, forwardRef } from '@nestjs/common';
import { LawyerController } from './lawyer.controller';
import { LawyerService } from './lawyer.service';
import { LawyerFiltersService } from './lawyer-filters.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lawyer } from './entities/lawyer.entity';
import { LawyersFilter } from './entities/lawyers-filter.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { Report } from './entities/report.entity';
import { ConsultationModule } from '../consultation/consultation.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { UserModule } from '../user/user.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { TimeSlot } from '../schedule/entities/timeslot.entity';
import { redisModule } from '../redis/redis.config';
import { Post } from '../post/post.entity';
import { PostModule } from '../post/post.module';
import { GeolocationModule } from '../geolocation/geolocation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lawyer,
      Schedule,
      LawyersFilter,
      Report,
      TimeSlot,
      Post,
    ]),
    forwardRef(() => ConsultationModule),
    forwardRef(() => FavoriteModule),
    forwardRef(() => FeedbackModule),
    forwardRef(() => UserModule),
    forwardRef(() => GeolocationModule),
    ScheduleModule,
    redisModule,
    PostModule,
  ],
  controllers: [LawyerController],
  providers: [LawyerService, LawyerFiltersService],
  exports: [LawyerService],
})
export class LawyerModule {}

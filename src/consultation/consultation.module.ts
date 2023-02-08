import { Module, forwardRef } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './consultation.entity';
import { CustomerModule } from '../customer/customer.module';
import { LawyerModule } from '../lawyer/lawyer.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { Feedback } from '../feedback/feedback.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consultation, Feedback]),
    forwardRef(() => CustomerModule),
    forwardRef(() => LawyerModule),
    ChatModule,
    ScheduleModule,
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}

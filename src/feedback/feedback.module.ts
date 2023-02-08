import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { LawyerModule } from '../lawyer/lawyer.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback]),
    forwardRef(() => CustomerModule),
    forwardRef(() => LawyerModule),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}

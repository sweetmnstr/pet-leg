import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { TimeSlot } from './entities/timeslot.entity';
import { Lawyer } from '../lawyer/entities/lawyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, TimeSlot, Lawyer])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}

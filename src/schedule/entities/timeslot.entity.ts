import { Consultation } from '../../consultation/consultation.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity({ name: 'timeSlot' })
export class TimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule, (schedule: Schedule) => schedule.timeslots)
  @JoinColumn()
  schedule: Schedule;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'time with time zone', nullable: false })
  startAt: string;

  @Column({ type: 'time with time zone', nullable: false })
  finishAt: string;

  @ManyToOne(
    () => Consultation,
    (consultation: Consultation) => consultation.timeslots,
  )
  consultation: Consultation;
}

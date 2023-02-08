import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lawyer } from '../../lawyer/entities/lawyer.entity';
import { Availability } from '../types/availability.type';
import { TimeSlot } from './timeslot.entity';

@Entity({ name: 'schedule' })
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json', { nullable: true })
  availability: Availability;

  @OneToOne(() => Lawyer, (lawyer: Lawyer) => lawyer.schedule)
  @JoinColumn()
  lawyer: Lawyer;

  @Column('text', { nullable: true })
  timezone: string;

  @OneToMany(() => TimeSlot, (timeslot: TimeSlot) => timeslot.schedule)
  timeslots: TimeSlot[];
}

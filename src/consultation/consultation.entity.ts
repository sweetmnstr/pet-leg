import { Customer } from '../customer/customer.entity';
import { Lawyer } from '../lawyer/entities/lawyer.entity';
import { TimeSlot } from '../schedule/entities/timeslot.entity';
import { RequestStatuses } from './enums/request-statuses.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SharedLink } from '../shared-link/shared-link.entity';
import { Report } from '../lawyer/entities/report.entity';
import { Feedback } from '../feedback/feedback.entity';

@Entity({ name: 'consultation' })
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lawyer, (lawyer: Lawyer) => lawyer.consultation)
  @JoinColumn()
  lawyer: Lawyer;

  @ManyToOne(() => Customer, (customer: Customer) => customer.consultation)
  @JoinColumn()
  customer: Customer;

  @OneToOne(() => Feedback)
  @JoinColumn()
  feedback?: Feedback;

  @OneToMany(() => TimeSlot, (timeslot: TimeSlot) => timeslot.consultation)
  @JoinColumn()
  timeslots: TimeSlot[];

  @Column({ type: 'text', nullable: true })
  communicationChannel: string | null;

  @Column({
    type: 'enum',
    enum: RequestStatuses,
    default: RequestStatuses.PENDING,
  })
  status: string;

  @OneToMany(
    () => SharedLink,
    (sharedLink: SharedLink) => sharedLink.consultation,
  )
  sharedLinks: SharedLink[];

  @OneToOne(() => Report, (report: Report) => report.consultation)
  report: Report;

  @Column({ type: 'text', nullable: true })
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

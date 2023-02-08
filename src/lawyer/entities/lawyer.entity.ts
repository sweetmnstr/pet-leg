import { Schedule } from '../../schedule/entities/schedule.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Languages } from '../enums/languages.enum';
import { LegalAreas } from '../enums/legalAreas.enum';
import { Specializations } from '../enums/specializations.enum';
import { Consultation } from '../../consultation/consultation.entity';
import { Feedback } from '../../feedback/feedback.entity';
import { Customer } from '../../customer/customer.entity';
import { ResumeItem } from '../types/resume.type';
import { Geolocation } from '../../geolocation/geolocation.entity';

@Entity({ name: 'lawyer' })
export class Lawyer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  introVideo: string;

  @Column({ type: 'enum', enum: Languages, nullable: true })
  language: Languages;

  @Column({ nullable: true })
  description: string;

  @Column({
    name: 'legal_areas',
    type: 'enum',
    enum: LegalAreas,
    nullable: true,
  })
  legalAreas: LegalAreas;

  @Column({ type: 'enum', enum: Specializations, nullable: true, array: true })
  specialization: Specializations[];

  @Column('jsonb', { nullable: true })
  education?: ResumeItem[];

  @Column('jsonb', { name: 'workExperience', nullable: true })
  workExperience?: ResumeItem[];

  @Column({ name: 'experienceTime', nullable: true })
  experienceTime: number;

  @Column('jsonb', { nullable: true })
  certifications?: ResumeItem[];

  @Column({ type: 'text', nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  city: string;

  @OneToOne(() => Schedule, (schedule: Schedule) => schedule.lawyer)
  schedule: Schedule;

  @OneToOne(
    () => Consultation,
    (consultation: Consultation) => consultation.lawyer,
  )
  consultation: Consultation;

  @Column({ type: 'boolean', default: false })
  hideFeedbacks: boolean;

  @OneToMany(() => Feedback, (feedback) => feedback.lawyer)
  feedbacks: Feedback[];

  @ManyToMany(() => Customer, (customer) => customer.favorites)
  customers: Customer[];

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column('text', { nullable: true })
  profileImage: string;

  @OneToOne(() => Geolocation, (geolocation: Geolocation) => geolocation.lawyer)
  geolocation: Geolocation;

  @Column('text', { nullable: true })
  introVideoThumbnail: string;
}

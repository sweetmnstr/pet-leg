import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Consultation } from '../../consultation/consultation.entity';

@Entity({ name: 'report' })
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  gender: string;

  @Column('int', { nullable: true })
  age: number;

  @Column('text', { nullable: true })
  phoneNumber: string;

  @Column('text', { nullable: true })
  statusOfBenificiary: string;

  @Column('text', { nullable: true })
  placeOfResidence: string;

  @Column('text', { nullable: true })
  clientOther: string;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column('text', { nullable: true })
  lawService: string;

  @Column('text', { nullable: true })
  caseOther: string;

  @Column('text', { nullable: true })
  issue: string;

  @Column('text', { nullable: true })
  typeOfAssistance: string;

  @Column('text', { nullable: true })
  placeOfConsultation: string;

  @Column('text', { nullable: true })
  amountOfConsultations: string;

  @Column('text', { nullable: true })
  moreDetails: string;

  @OneToOne(
    () => Consultation,
    (consultation: Consultation) => consultation.report,
  )
  @JoinColumn()
  consultation: Consultation;
}

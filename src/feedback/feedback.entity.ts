import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Lawyer } from '../lawyer/entities/lawyer.entity';

@Entity({ name: 'feedback' })
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @ManyToOne(() => Lawyer, (lawyer) => lawyer.feedbacks)
  @JoinColumn()
  lawyer: Lawyer;

  @Column({
    type: 'text',
    nullable: true,
  })
  review: string | null;

  @Column({
    type: 'float',
    nullable: false,
  })
  grade: number;

  @CreateDateColumn()
  createdAt: Date;
}

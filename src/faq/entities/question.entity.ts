import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FaqCategory } from './faq-category.entity';

@Entity({ name: 'question' })
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  question: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  answer: string;

  @Column({ type: 'text', nullable: true })
  country: string;

  @ManyToOne(() => FaqCategory, (category: FaqCategory) => category.questions)
  @JoinColumn()
  category: FaqCategory;
}

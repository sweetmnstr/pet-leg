import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FAQTypes } from '../enums/faq-types.enum';
import { Question } from './question.entity';

@Entity({ name: 'faq' })
export class FaqCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({ type: 'enum', enum: FAQTypes, nullable: true })
  type: FAQTypes;

  @OneToMany(() => Question, (question: Question) => question.category)
  questions: Question[];
}

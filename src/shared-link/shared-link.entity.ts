import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Consultation } from '../consultation/consultation.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'sharedLink' })
export class SharedLink {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Consultation, (consultation) => consultation.sharedLinks, {
    nullable: true,
  })
  @JoinColumn()
  consultation: Consultation;

  @ManyToOne(() => User, {
    nullable: true,
  })
  @JoinColumn()
  conversationUser: User;

  @Column({ type: 'varchar', nullable: false })
  link: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}

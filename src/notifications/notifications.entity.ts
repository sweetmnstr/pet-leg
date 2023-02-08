import { User } from '../user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationTypes } from './enums/notification-types.enum';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn()
  user: User;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  link: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'time with time zone', nullable: false })
  expiredAt: string;

  @Column({ type: 'enum', enum: NotificationTypes, nullable: false })
  type: NotificationTypes;
}

import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'notificationFilters' })
export class NotificationFilters {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.notificationFilters)
  user: User;

  @Column('boolean', { default: false })
  customerSessionUpdates: boolean;

  @Column('boolean', { default: false })
  lawyerSessionUpdates: boolean;

  @Column('boolean', { default: false })
  customerNewMessages: boolean;

  @Column('boolean', { default: false })
  lawyerNewMessages: boolean;

  @Column('boolean', { default: false })
  customerSharedLinksUpdates: boolean;

  @Column('boolean', { default: false })
  lawyerSharedLinksUpdates: boolean;

  @Column('boolean', { default: false })
  customerGeneralNotifications: boolean;

  @Column('boolean', { default: false })
  lawyerGeneralNotifications: boolean;
}

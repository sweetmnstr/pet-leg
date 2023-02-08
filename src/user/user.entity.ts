import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserRoles } from './enums/user-roles.enum';
import { Languages } from './enums/languages.enum';
import { Lawyer } from '../lawyer/entities/lawyer.entity';
import { Customer } from '../customer/customer.entity';
import { NotificationFilters } from '../notification-filters/notification-filters.entity';
import { Notification } from '../notifications/notifications.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  firstName: string;

  @Column('text', { nullable: true })
  lastName: string;

  @Column('text', { nullable: false })
  email: string;

  @Column('text', { nullable: false, select: false })
  password: string;

  @Column('text', { nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  timezone: string;

  @Column({ type: 'enum', enum: Languages, nullable: true })
  platformLanguage: Languages;

  @Column({ type: 'enum', enum: UserRoles, nullable: true })
  roles: UserRoles;

  @OneToOne(() => Lawyer, (lawyer) => lawyer.user)
  lawyer: Lawyer;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;

  @OneToOne(() => NotificationFilters)
  @JoinColumn()
  notificationFilters: NotificationFilters;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @Column('text', { nullable: true })
  photo: string;

  @Column('text', { nullable: true })
  twilioUserSid: string;

  @Column('text', { nullable: true })
  twilioIdentitySid: string;
}

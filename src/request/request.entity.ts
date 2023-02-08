import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RequestTypes } from './enum/request-types.enum';
import { RequestStatusesEnum } from './enum/request-statuses.enum';

@Entity({ name: 'request' })
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  requester: number;

  @Column({ type: 'enum', enum: RequestTypes, nullable: false })
  type: RequestTypes;

  @Column({ type: 'enum', enum: RequestStatusesEnum, nullable: false })
  status: RequestStatusesEnum;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  assignee: User;

  @Column({ nullable: true })
  context: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}

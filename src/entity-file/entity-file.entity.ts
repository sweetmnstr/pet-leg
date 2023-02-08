import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('entityFile')
export class EntityFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  url: string;

  @Column({ nullable: false })
  key: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'entityId' })
  entityId: number;
}

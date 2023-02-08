import { Lawyer } from '../lawyer/entities/lawyer.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'geolocation' })
export class Geolocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float', { nullable: false })
  longitude: number;

  @Column('float', { nullable: false })
  latitude: number;

  @OneToOne(() => Lawyer, (lawyer: Lawyer) => lawyer.geolocation)
  @JoinColumn()
  lawyer: Lawyer;
}

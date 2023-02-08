import { Consultation } from '../consultation/consultation.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { AuthType } from './enums/auth-types.enum';
import { Lawyer } from '../lawyer/entities/lawyer.entity';

@Entity({ name: 'customer' })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: AuthType,
    default: AuthType.GOOGLE,
  })
  authType: AuthType;

  @ManyToMany(() => Lawyer, (lawyer) => lawyer.customers)
  @JoinTable({
    name: 'favorite',
    joinColumn: {
      name: 'customerId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'lawyerId',
      referencedColumnName: 'id',
    },
  })
  favorites: Lawyer[];

  @OneToOne(
    () => Consultation,
    (consultation: Consultation) => consultation.customer,
  )
  consultation: Consultation;
}

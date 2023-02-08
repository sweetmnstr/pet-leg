import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Lawyer } from '../lawyer/entities/lawyer.entity';
import { Customer } from '../customer/customer.entity';

@Entity({ name: 'favorite' })
export class Favorite {
  @PrimaryColumn({
    name: 'lawyerId',
    type: 'integer',
    primaryKeyConstraintName: 'lawyer_customer',
  })
  @ManyToOne(() => Lawyer)
  lawyer: Lawyer;

  @PrimaryColumn({
    name: 'customerId',
    type: 'integer',
    primaryKeyConstraintName: 'lawyer_customer',
  })
  @ManyToOne(() => Customer, (customer) => customer.favorites)
  customer: Customer;
}

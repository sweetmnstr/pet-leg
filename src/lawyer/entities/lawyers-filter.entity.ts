import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FilterValues } from '../enums/filter-values.enum';

@Entity({ name: 'lawyers-filter' })
export class LawyersFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  filterName: string;

  @Column('text', { array: true })
  filterValues: FilterValues[];
}

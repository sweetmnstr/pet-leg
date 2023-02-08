import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RecommendationTypes } from './recommendations.enum';
import { Locales } from './recommendations.types';

@Entity({ name: 'recommendations' })
export class Recommendations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RecommendationTypes, nullable: true })
  type: RecommendationTypes;

  @Column('text', { array: true })
  values: string[];

  @Column('text', { nullable: true })
  category: string;

  @Column('json')
  locales: Locales;
}

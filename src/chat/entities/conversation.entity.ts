import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'conversation' })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  externalId: string;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  user1Read: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  user2Read: boolean;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'refresh-session' })
export class RefreshSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  refreshToken: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  fingerprint: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  ip: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  ua: string;

  @Column({
    type: 'bigint',
    nullable: false,
  })
  expiresIn: string;
}

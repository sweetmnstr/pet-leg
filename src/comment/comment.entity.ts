import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Post } from '../post/post.entity';

@Entity({ name: 'comment' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post)
  @JoinColumn()
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}

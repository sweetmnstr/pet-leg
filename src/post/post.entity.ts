import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';
import { Category } from '../category/category.entity';
import { PostStatuses } from './enums/post-statuses.enum';

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column()
  content: string;

  @ManyToOne(() => Category)
  @JoinColumn()
  category: Category;

  @Column({ type: 'integer', array: true, default: '{}' })
  liked: number[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column({ type: 'enum', enum: PostStatuses, default: PostStatuses.PENDING })
  status: PostStatuses;

  @Column({ type: 'text', array: true, default: '{}' })
  thumbnails: string[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: true })
  enableComments: boolean;
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class CommentService extends TypeOrmCrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userService: UserService,
  ) {
    super(commentRepository);
  }

  async create(createCommentDto: CreateCommentDTO): Promise<Comment> {
    const user = await this.userService.getUser(createCommentDto.createdById);
    if (!user) throw new BadRequestException('User doesn`t exist');

    const comment = this.commentRepository.create(createCommentDto);
    return this.commentRepository.save(comment);
  }

  async getComments(postId, page, commentsPerPost) {
    const [comments, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.post', 'post')
      .where('post.id = :id', { id: postId })
      .skip(commentsPerPost * (page - 1))
      .take(commentsPerPost)
      .getManyAndCount();
    return { comments, total };
  }
}

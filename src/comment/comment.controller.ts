import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(public service: CommentService) {}

  @Get('get-comments/:postId')
  @HttpCode(200)
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('commentsPerPost', ParseIntPipe) commentsPerPost: number,
  ) {
    return this.service.getComments(postId, page, commentsPerPost);
  }
}

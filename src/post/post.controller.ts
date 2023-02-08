import {
  Controller,
  Get,
  HttpCode,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Body,
  Param,
  Post,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoles } from '../user/enums/user-roles.enum';
import { PostService } from './post.service';
import { UserService } from '../user/user.service';
import { SignInDto } from '../auth/dto/signin.dto';
import { Post as PostEntity } from './post.entity';

@Controller('post')
export class PostController {
  constructor(public service: PostService, private userService: UserService) {}

  @Get('get-blog-posts')
  @HttpCode(200)
  getBlogPosts(
    @Query('sortBy') sortBy: string,
    @Query('postsForPage', ParseIntPipe) postsForPage: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.service.getBlogPosts(sortBy, postsForPage, page);
  }

  @Patch('like-post')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async likePost(
    @Req() req: Express.Request,
    @Body('postId') postId: number,
  ): Promise<void> {
    const user = await this.userService.getUserByAuth(req.user as SignInDto);
    return this.service.likePost(+user.id, +postId);
  }

  @Patch('unlike-post')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async unlikePost(
    @Req() req: Express.Request,
    @Body('postId') postId: number,
  ): Promise<void> {
    const user = await this.userService.getUserByAuth(req.user as SignInDto);
    return this.service.unlikePost(+user.id, +postId);
  }

  @Post('comment-post/:postId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(201)
  async commentPost(
    @Req() req: Express.Request,
    @Param('postId') postId: number,
    @Body('comment') comment: string,
  ): Promise<PostEntity> {
    const user = await this.userService.getUserByAuth(req.user as SignInDto);
    return this.service.commentPost(+user.id, +postId, comment);
  }

  @Get('/:postId')
  @HttpCode(200)
  async getPostById(@Param('postId') postId: string): Promise<PostEntity> {
    if (!postId) throw new BadRequestException('INVALID_POST_ID');
    return this.service.getPostById(+postId);
  }
}

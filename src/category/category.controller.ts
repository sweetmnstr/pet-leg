import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { PostService } from '../post/post.service';

@Controller('category')
export class CategoryController {
  constructor(
    public service: CategoryService,
    public postsService: PostService,
  ) {}

  @Get('get-categories')
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    return this.service.getCategories();
  }

  @Get('get-category/:categoryId')
  async getCategory(
    @Param('categoryId') categoryId: number,
    @Query('postsForPage', ParseIntPipe) postsForPage: number,
    @Query('sortBy') sortBy: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    if (!categoryId) throw new BadRequestException('INVALID_POST_ID');
    return this.postsService.getCategory(
      sortBy,
      postsForPage,
      page,
      categoryId,
    );
  }
}

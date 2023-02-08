import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Category } from './category.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { GetCategoryDto } from './dto/get-category.dto';
import { Categories } from './enums/categories.enum';
import { Post } from '../post/post.entity';

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category> {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private dataSource: DataSource,
  ) {
    super(categoryRepository);
  }

  async getPostsByCategories(
    sortBy: string,
    postsForPage: number,
    page: number,
  ): Promise<Category[]> {
    let query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.posts', 'posts')
      .skip(postsForPage * (page - 1))
      .take(postsForPage);

    if (sortBy === 'date') {
      query = query.orderBy('posts.createdAt', 'DESC');
    }

    const posts = await query.getMany();

    if (sortBy === 'popularity') {
      posts.map((category) =>
        category.posts.sort((a, b) => b.liked.length - a.liked.length),
      );
    }

    return posts;
  }

  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    const categories = await this.categoryRepository.find();
    return {
      categories,
      total: categories.length,
    };
  }

  async getCategory(getCategoryDto: GetCategoryDto): Promise<{
    title: string;
    subtitle: string;
    posts: Post[];
    total: number;
  }> {
    const { categoryId, postsForPage, page } = getCategoryDto;
    const categoryResponse = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.posts', 'posts')
      .where('category.id = :id', { id: categoryId })
      .skip(postsForPage * (page - 1))
      .take(postsForPage)
      .orderBy('posts.createdAt', 'DESC')
      .getMany();
    const { title, subtitle, posts } = categoryResponse[0];

    return { title, subtitle, posts, total: posts.length };
  }
}

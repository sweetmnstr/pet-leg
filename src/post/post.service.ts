import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CommentService } from '../comment/comment.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { Comment } from '../comment/comment.entity';
import { CategoryService } from '../category/category.service';
import { Sorts } from 'src/lawyer/enums/sorts.enum';
import { GetCategoryDto } from 'src/category/dto/get-category.dto';

@Injectable()
export class PostService extends TypeOrmCrudService<Post> {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private categoryService: CategoryService,
    private commentService: CommentService,
  ) {
    super(postRepository);
  }

  async likePost(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('INVALID_POST_ID');

    post.liked = !post.liked.includes(userId)
      ? [...post.liked, userId]
      : post.liked;

    await this.postRepository.save(post);
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('INVALID_POST_ID');

    const idx = post.liked.indexOf(userId);
    post.liked = [...post.liked.slice(0, idx), ...post.liked.slice(idx + 1)];

    await this.postRepository.save(post);
  }

  async commentPost(
    userId: number,
    postId: number,
    comment: string,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('INVALID_POST_ID');

    await this.commentService.create({
      createdById: userId,
      post,
      content: comment,
    });

    return this.postRepository.findOne({
      where: { id: postId },
      relations: {
        comments: true,
      },
    });
  }
  async getUserPostById(userId: number, postId: number) {
    return this.postRepository.findOne({
      where: { createdBy: { id: userId }, id: postId },
    });
  }

  async createPost(body: CreatePostDTO) {
    const post = this.postRepository.create(body);
    return this.postRepository.manager.save(post);
  }

  async updatePost(body: UpdatePostDTO) {
    const post = await this.getUserPostById(body.user.id, body.postId);
    if (!post) throw new BadRequestException('Post not found');

    if (body.title) post.title = body.title;
    if (body.content) post.content = body.content;
    if (body.thumbnails) post.thumbnails = body.thumbnails;
    if (body.tags) post.tags = body.tags;
    if (typeof body.enableComments === 'boolean')
      post.enableComments = body.enableComments;

    await this.postRepository.manager.save(post);
  }

  async deleteUserPostById(userId: number, postId: number) {
    const post = await this.getUserPostById(userId, postId);
    if (!post) throw new BadRequestException('Post not found');

    await this.postRepository
      .createQueryBuilder('comment')
      .delete()
      .from(Comment)
      .where('postId = :postId', { postId })
      .execute();

    return this.postRepository.delete(post.id);
  }
  async getBlogPosts(sortBy: string, postsForPage: number, page: number) {
    const categories = [];
    let query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .skip(postsForPage * (page - 1))
      .take(postsForPage);

    if (sortBy === 'date') {
      query = query.orderBy('post.createdAt', 'DESC');
    }

    const posts = await query.getMany();

    if (sortBy === 'popularity') {
      posts.sort((a, b) => b.liked.length - a.liked.length);
    }

    const reducedCategories = this.getReducedPosts(posts, categories);

    return this.mapCategories(reducedCategories);
  }

  private async mapCategories(categories) {
    const mapped = [];

    for await (const category of categories) {
      const total = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin('post.category', 'category')
        .where('category.id = :id', { id: category.id })
        .getCount();
      category.total = total;

      mapped.push(category);
    }

    return mapped;
  }

  private getReducedPosts(posts: Post[], categories: any) {
    return posts.reduce((acc, post) => {
      const category = acc.filter(
        (category) => category.title === post.category.title,
      )[0];
      if (!!category) {
        delete post.category;
        category.posts.push(post);
      } else {
        const newCategory = post.category;

        delete post.category;

        acc.push({ ...newCategory, posts: [post] });
      }
      return categories;
    }, categories);
  }

  async getCategory(
    sortBy: string,
    postsForPage: number,
    page: number,
    categoryId: number,
  ) {
    const categories = [];
    let query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .where('category.id = :id', { id: categoryId })
      .skip(postsForPage * (page - 1))
      .take(postsForPage);

    if (sortBy === 'date') {
      query = query.orderBy('post.createdAt', 'DESC');
    }

    const posts = await query.getMany();
    if (sortBy === 'popularity') {
      posts.sort((a, b) => b.liked.length - a.liked.length);
    }

    const reducedCategories = this.getReducedPosts(posts, categories);

    return (await this.mapCategories(reducedCategories))[0];
  }

  async getPostById(id: number) {
    return this.postRepository.findOne({ where: { id } });
  }
}

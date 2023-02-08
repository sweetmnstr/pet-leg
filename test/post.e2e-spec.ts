import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Customer } from '../src/customer/customer.entity';
import { Post } from '../src/post/post.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let postRepository: Repository<Post>;
  let customer: Customer;
  let posts: Post[];
  let customerAuthToken: string;

  beforeEach(async () => {
    // init app
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RabbitMQ)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // setup repositories
    customerRepository = moduleFixture.get('CustomerRepository');
    postRepository = moduleFixture.get('PostRepository');

    // setup services
    jwtService = new JwtService({
      secretOrPrivateKey: process.env.JWT_SECRET,
    });

    // setup data
    customer = await customerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'dariana@customer.com' } },
    });
    customerAuthToken = jwtService.sign({
      email: customer.user.email,
      roles: customer.user.roles,
    });
    posts = await postRepository.find();
  });

  afterEach(async () => {
    customerAuthToken = undefined;
  });

  describe("test 'like-post' endpoint", () => {
    it('should add user id to post liked array', async () => {
      return request(app.getHttpServer())
        .patch(`/post/like-post`)
        .set('x-auth-token', customerAuthToken)
        .send({ postId: posts[0].id })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad request exception when post doesn`t exist', () => {
      return request(app.getHttpServer())
        .patch(`/post/like-post`)
        .set('x-auth-token', customerAuthToken)
        .send({ postId: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .patch(`/post/like-post`)
        .send({ postId: posts[0].id })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("test 'unlike-post' endpoint", () => {
    it('should remove user id from post liked array', async () => {
      return request(app.getHttpServer())
        .patch(`/post/unlike-post`)
        .set('x-auth-token', customerAuthToken)
        .send({ postId: posts[0].id })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad request exception when post doesn`t exist', () => {
      return request(app.getHttpServer())
        .patch(`/post/unlike-post`)
        .set('x-auth-token', customerAuthToken)
        .send({ postId: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .patch(`/post/unlike-post`)
        .send({ postId: posts[0].id })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("test 'comment-post' endpoint", () => {
    it('should add new comment to post', async () => {
      return request(app.getHttpServer())
        .post(`/post/comment-post/${posts[0].id}`)
        .set('x-auth-token', customerAuthToken)
        .send({ comment: 'Great!' })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('title');
          expect(body).toHaveProperty('tags');
          expect(body).toHaveProperty('content');
          expect(body).toHaveProperty('liked');
          expect(body).toHaveProperty('status');
          expect(body).toHaveProperty('thumbnails');
          expect(body).toHaveProperty('createdAt');
          expect(body).toHaveProperty('comments');
          expect(body.comments).not.toHaveLength(0);
          expect(body.comments[0]).toHaveProperty('id');
          expect(body.comments[0]).toHaveProperty('content');
          expect(body.comments[0]).toHaveProperty('createdAt');
        });
    });

    it('should return bad request exception when post doesn`t exist', () => {
      return request(app.getHttpServer())
        .post(`/post/comment-post/0`)
        .set('x-auth-token', customerAuthToken)
        .send({ comment: 'Something bad' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post(`/post/comment-post/${posts[0].id}`)
        .send({ comment: 'I want my permissions' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Customer } from '../src/customer/customer.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;

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
  });

  describe("test 'get-categories' endpoint", () => {
    it('should return all categories without posts', () => {
      return request(app.getHttpServer())
        .get(`/category/get-categories`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('categories');
          expect(body).toHaveProperty('total');
          expect(body.categories).toHaveLength(6);
          expect(body.total).toBe(6);
          expect(body.categories[0]).toHaveProperty('id');
          expect(body.categories[0]).toHaveProperty('title');
          expect(body.categories[0]).toHaveProperty('subtitle');
        });
    });
  });

  describe("test 'get-category' endpoint", () => {
    it('should return all categories without posts', () => {
      return request(app.getHttpServer())
        .get(`/category/get-category/1?postsForPage=2&page=1`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('title');
          expect(body).toHaveProperty('subtitle');
          expect(body).toHaveProperty('posts');
          expect(body).toHaveProperty('total');
          expect(body.posts).toHaveLength(2);
          expect(body.total).toBe(2);
          expect(body.posts[0]).toHaveProperty('id');
          expect(body.posts[0]).toHaveProperty('title');
          expect(body.posts[0]).toHaveProperty('tags');
          expect(body.posts[0]).toHaveProperty('content');
          expect(body.posts[0]).toHaveProperty('liked');
          expect(body.posts[0]).toHaveProperty('status');
          expect(body.posts[0]).toHaveProperty('thumbnails');
          expect(body.posts[0]).toHaveProperty('createdAt');
        });
    });
  });
});

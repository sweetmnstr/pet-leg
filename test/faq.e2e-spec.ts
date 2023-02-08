import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Customer } from '../src/customer/customer.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('FAQController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let customer: Customer;
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

    // setup services
    jwtService = new JwtService({
      secretOrPrivateKey: process.env.JWT_SECRET,
    });
    customer = await customerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'dariana@customer.com' } },
    });
    customerAuthToken = jwtService.sign({
      email: customer.user.email,
      roles: customer.user.roles,
    });
  });

  afterEach(async () => {
    customerAuthToken = undefined;
  });

  describe("test 'get-faq' endpoint", () => {
    it('should return faq', () => {
      return request(app.getHttpServer())
        .get(`/faq/get-faq`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body[0]).toHaveProperty('name');
          expect(body[0]).toHaveProperty('questions');
          expect(body[0].questions[0]).toHaveProperty('question');
          expect(body[0].questions[0]).toHaveProperty('answer');
        });
    });
  });
});

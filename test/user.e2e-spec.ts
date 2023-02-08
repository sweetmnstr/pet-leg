import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Customer } from '../src/customer/customer.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('UserController (e2e)', () => {
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

  afterEach(() => {
    customerAuthToken = undefined;
  });

  describe("test 'update-password' endpoint", () => {
    it('should update user password', () => {
      return request(app.getHttpServer())
        .patch(`/user/update-password`)
        .set('x-auth-token', customerAuthToken)
        .send({
          password: '12345678',
          repeatedPassword: '12345678',
        })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return message that passwords don`t match', () => {
      return request(app.getHttpServer())
        .patch(`/user/update-password`)
        .set('x-auth-token', customerAuthToken)
        .send({
          password: '12345678',
          repeatedPassword: '123456',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});

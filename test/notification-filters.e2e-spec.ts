import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository, DeepPartial } from 'typeorm';
import { Customer } from '../src/customer/customer.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';
import { NotificationFilters } from '../src/notification-filters/notification-filters.entity';

describe('NotificationFiltersController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let customer: Customer;
  let customerAuthToken: string;
  let updateUserNotificationFiltersDto: DeepPartial<NotificationFilters>;

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

    updateUserNotificationFiltersDto = {
      customerSessionUpdates: true,
      customerNewMessages: true,
    };

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

  describe("test 'get-user-notification-filters' endpoint", () => {
    it("should return user's notification filters", () => {
      return request(app.getHttpServer())
        .get(
          `/notification-filters/get-user-notification-filters?userId=${customer.user.id}`,
        )
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('customerSessionUpdates');
          expect(body).toHaveProperty('lawyerSessionUpdates');
          expect(body).toHaveProperty('customerNewMessages');
          expect(body).toHaveProperty('lawyerNewMessages');
          expect(body).toHaveProperty('customerSharedLinksUpdates');
          expect(body).toHaveProperty('lawyerSharedLinksUpdates');
          expect(body).toHaveProperty('customerGeneralNotifications');
          expect(body).toHaveProperty('lawyerGeneralNotifications');
        });
    });

    it('should return bad requset when user is not exist', () => {
      return request(app.getHttpServer())
        .get(`/notification-filters/get-user-notification-filters?userId=0`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("test 'update-user-notification-filters' endpoint", () => {
    it("should update user's notification filters", () => {
      return request(app.getHttpServer())
        .patch(
          `/notification-filters/update-user-notification-filters/${customer.user.id}`,
        )
        .set('x-auth-token', customerAuthToken)
        .send(updateUserNotificationFiltersDto)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad requset when user is not exist', () => {
      return request(app.getHttpServer())
        .patch(`/notification-filters/update-user-notification-filters/0`)
        .set('x-auth-token', customerAuthToken)
        .send(updateUserNotificationFiltersDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});

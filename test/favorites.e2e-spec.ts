import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Lawyer } from '../src/lawyer/entities/lawyer.entity';
import { Customer } from '../src/customer/customer.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('FavoriteController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let lawyerRepository: Repository<Lawyer>;
  let customer: Customer;
  let lawyer: Lawyer;
  let notAddedlawyer: Lawyer;
  let customerAuthToken: string;
  let lawyerAuthToken: string;

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
    lawyerRepository = moduleFixture.get('LawyerRepository');

    // setup services
    jwtService = new JwtService({
      secretOrPrivateKey: process.env.JWT_SECRET,
    });

    // setup data
    lawyer = await lawyerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'darrion@lawyer.com' } },
    });
    notAddedlawyer = await lawyerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'emily@lawyer.com' } },
    });
    customer = await customerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'dariana@customer.com' } },
    });
    customerAuthToken = jwtService.sign({
      email: customer.user.email,
      roles: customer.user.roles,
      customerId: customer.id,
    });
    lawyerAuthToken = jwtService.sign({
      email: lawyer.user.email,
      roles: lawyer.user.roles,
    });
  });

  afterEach(async () => {
    customerAuthToken = undefined;
    lawyerAuthToken = undefined;
    // do not delete customer's favorites lawyers, 'because it will break seed structure
  });

  describe("test 'get-favorites' endpoint", () => {
    const page = 1,
      limit = 1;

    it("should return customer's favorite lawyers", () => {
      return request(app.getHttpServer())
        .get(
          `/favorite/get-favorites/${customer.id}?limit=${limit}&page=${page}`,
        )
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('favorites');
          expect(body).toHaveProperty('total');
          body.favorites.map((favorite) => {
            expect(favorite).toHaveProperty('id');
            expect(favorite).toHaveProperty('introVideo');
            expect(favorite).toHaveProperty('firstName');
            expect(favorite).toHaveProperty('lastName');
            expect(favorite).toHaveProperty('title');
            expect(favorite).toHaveProperty('legalAreas');
            expect(favorite).toHaveProperty('language');
            expect(favorite).toHaveProperty('country');
            expect(favorite).toHaveProperty('description');
            expect(favorite).toHaveProperty('experienceTime');
            expect(favorite).toHaveProperty('profileImage');
            expect(favorite).toHaveProperty('isVerified');
            expect(favorite).toHaveProperty('consultationsCount');
            expect(favorite).toHaveProperty('resume');
            expect(favorite).toHaveProperty('totalReviews');
            expect(favorite).toHaveProperty('averageGrade');
          });
        });
    });

    it('should return customer not found', () => {
      return request(app.getHttpServer())
        .get(`/favorite/get-favorites/0?limit=${limit}&page=${page}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(
          `/favorite/get-favorites/${customer.id}?limit=${limit}&page=${page}`,
        )
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(
          `/favorite/get-favorites/${customer.id}?limit=${limit}&page=${page}`,
        )
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'is-lawyers-in-favorites' endpoint", () => {
    it('should return array with if each lawyer in favorites', () => {
      return request(app.getHttpServer())
        .get(
          `/favorite/is-lawyers-in-favorites?lawyersIds=${lawyer.id}&lawyersIds=${notAddedlawyer.id}`,
        )
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveLength(2);
          body.map((favorite) => {
            expect(favorite).toHaveProperty('lawyerId');
            expect(favorite).toHaveProperty('isInFavorites');
          });
        });
    });

    it('should return one of lawyers not found', () => {
      return request(app.getHttpServer())
        .get(
          `/favorite/is-lawyers-in-favorites?lawyersIds=${lawyer.id}&lawyersIds=10`,
        )
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.message).toBe('Lawyer with id 10 not found');
        });
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(
          `/favorite/is-lawyers-in-favorites?lawyersIds=${lawyer.id}&lawyersIds=${notAddedlawyer.id}`,
        )
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("test 'add-lawyer-to-favorites' endpoint", () => {
    it('should add lawyer to customer favourites', async () => {
      return request(app.getHttpServer())
        .post(`/favorite/add-lawyer-to-favorites`)
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: notAddedlawyer.id,
        })
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toHaveProperty('lawyer');
          expect(body).toHaveProperty('customer');
          expect(body.lawyer).toHaveProperty('id');
          expect(body.lawyer).toHaveProperty('introVideo');
          expect(body.lawyer).toHaveProperty('firstName');
          expect(body.lawyer).toHaveProperty('lastName');
          expect(body.lawyer).toHaveProperty('title');
          expect(body.lawyer).toHaveProperty('legalAreas');
          expect(body.lawyer).toHaveProperty('language');
          expect(body.lawyer).toHaveProperty('country');
          expect(body.lawyer).toHaveProperty('description');
          expect(body.lawyer).toHaveProperty('experienceTime');
          expect(body.lawyer).toHaveProperty('profileImage');
          expect(body.lawyer).toHaveProperty('isVerified');
          expect(body.lawyer).toHaveProperty('consultationsCount');
          expect(body.lawyer).toHaveProperty('resume');
          expect(body.customer).toHaveProperty('id');
          expect(body.customer).toHaveProperty('firstName');
          expect(body.customer).toHaveProperty('lastName');
          expect(body.customer).toHaveProperty('email');
          expect(body.customer).toHaveProperty('timezone');
          expect(body.customer).toHaveProperty('photo');
          expect(body.customer).toHaveProperty('bindedSocials');
        });
    });

    it('should return lawyer not found', () => {
      return request(app.getHttpServer())
        .post(`/favorite/add-lawyer-to-favorites`)
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: 0,
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return lawyer already in favourites', () => {
      return request(app.getHttpServer())
        .post(`/favorite/add-lawyer-to-favorites`)
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: lawyer.id,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("test 'remove-lawyer-from-favorites' endpoint", () => {
    it('should remove lawyer from customer favourites', async () => {
      return request(app.getHttpServer())
        .delete(`/favorite/remove-lawyer-from-favorites`)
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: notAddedlawyer.id,
        })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return lawyer not found', () => {
      return request(app.getHttpServer())
        .delete(`/favorite/remove-lawyer-from-favorites`)
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: 0,
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return lawyer is not in customer favourites', () => {
      return request(app.getHttpServer())
        .delete(`/favorite/remove-lawyer-from-favorites`)
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: notAddedlawyer.id,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Lawyer } from '../src/lawyer/entities/lawyer.entity';
import { Customer } from '../src/customer/customer.entity';
import { Consultation } from '../src/consultation/consultation.entity';
import { SharedLink } from '../src/shared-link/shared-link.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('SharedLinkController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let lawyerRepository: Repository<Lawyer>;
  let consultationRepository: Repository<Consultation>;
  let sharedLinkRepository: Repository<SharedLink>;
  let customer: Customer;
  let customer2: Customer;
  let lawyer: Lawyer;
  let consultation: Consultation;
  let sharedLink: SharedLink;
  let customerAuthToken: string;
  let customerAuthToken2: string;

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
    consultationRepository = moduleFixture.get('ConsultationRepository');
    sharedLinkRepository = moduleFixture.get('SharedLinkRepository');

    // setup services
    jwtService = new JwtService({
      secretOrPrivateKey: process.env.JWT_SECRET,
    });

    // setup data
    lawyer = await lawyerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'darrion@lawyer.com' } },
    });
    customer = await customerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'dariana@customer.com' } },
    });
    customer2 = await customerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'alan@customer.com' } },
    });
    consultation = consultationRepository.create({
      lawyer: {
        id: lawyer.id,
      },
      customer: {
        id: customer.id,
      },
      communicationChannel: 'sharedLink',
    });
    consultation = await consultationRepository.manager.save(consultation);
    sharedLink = sharedLinkRepository.create({
      consultation,
      link: 'http://google.com',
      user: customer.user,
    });
    customerAuthToken = jwtService.sign({
      email: customer.user.email,
      roles: customer.user.roles,
    });
    customerAuthToken2 = jwtService.sign({
      email: customer2.user.email,
      roles: customer2.user.roles,
    });
  });

  afterEach(async () => {
    customerAuthToken = undefined;
    customerAuthToken2 = undefined;
    await sharedLinkRepository.delete({
      consultation: {
        id: consultation.id,
      },
    });
    await consultationRepository.delete({ id: consultation.id });
  });

  describe("test 'add-shared-link' endpoint", () => {
    it('should create and return entity', () => {
      return request(app.getHttpServer())
        .post('/shared-link/add-shared-link')
        .set('x-auth-token', customerAuthToken)
        .send({
          consultationId: consultation.id,
          link: 'https://example.com?someParam=1',
        })
        .expect(HttpStatus.CREATED);
    });

    it('should return errors', () => {
      return request(app.getHttpServer())
        .post('/shared-link/add-shared-link')
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return consultation not found error', () => {
      return request(app.getHttpServer())
        .post('/shared-link/add-shared-link')
        .set('x-auth-token', customerAuthToken)
        .send({
          consultationId: 0,
          link: 'https://example.com',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post('/shared-link/add-shared-link')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return bad request status if user is not belongs to consultation', async () => {
      return request(app.getHttpServer())
        .post('/shared-link/add-shared-link')
        .send({
          consultationId: consultation.id,
          link: 'https://example.com',
        })
        .set('x-auth-token', customerAuthToken2)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toContain("User isn't belongs to consultation");
        });
    });
  });

  describe("test 'update-shared-link' endpoint", () => {
    it('should update successfully and return no content status', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .put(`/shared-link/update-shared-link/${sharedLink.id}`)
        .set('x-auth-token', customerAuthToken)
        .send({ link: 'https://google.com' })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return errors', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .put(`/shared-link/update-shared-link/${sharedLink.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return shared link not found', () => {
      return request(app.getHttpServer())
        .put(`/shared-link/update-shared-link/0`)
        .set('x-auth-token', customerAuthToken)
        .send({ link: 'https://google.com' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return unauthorized status', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .put(`/shared-link/update-shared-link/${sharedLink.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .put(`/shared-link/update-shared-link/${sharedLink.id}`)
        .set('x-auth-token', customerAuthToken2)
        .send({ link: 'https://google.com' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toContain('User cannot to remove');
        });
    });
  });

  describe("test 'remove-shared-link' endpoint", () => {
    it('should remove successfully return no content', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-shared-link/${sharedLink.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return shared link is not found', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-shared-link/0`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return unauthorized status', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-shared-link/${sharedLink.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-shared-link/${sharedLink.id}`)
        .set('x-auth-token', customerAuthToken2)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toContain('User cannot to remove');
        });
    });
  });

  describe("test 'remove-all-shared-link' endpoint", () => {
    it('should remove successfully and return no content status', () => {
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-all-shared-link`)
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: consultation.id })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad request status', () => {
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-all-shared-link`)
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-all-shared-link`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .delete(`/shared-link/remove-all-shared-link`)
        .send({
          consultationId: consultation.id,
          link: 'https://example.com',
        })
        .set('x-auth-token', customerAuthToken2)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toContain("User isn't belongs to consultation");
        });
    });
  });

  describe("test 'consultation-shared-links' endpoint", () => {
    it('should return a list of links', async () => {
      let sharedLink = sharedLinkRepository.create({
        link: 'http://',
        consultation,
        user: lawyer.user,
      });
      sharedLink = await sharedLinkRepository.manager.save(sharedLink);
      const response = await request(app.getHttpServer())
        .get(`/shared-link/consultation-shared-links/${consultation.id}`)
        .set('x-auth-token', customerAuthToken);
      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('link');
      expect(response.body[0]).toHaveProperty('consultationId');
      expect(response.body[0]).toHaveProperty('belongsTo');
      await sharedLinkRepository.delete({ id: sharedLink.id });
    });

    it('should return bad request status (consultation not found)', () => {
      return request(app.getHttpServer())
        .get(`/shared-link/consultation-shared-links/0`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/shared-link/consultation-shared-links/${consultation.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(`/shared-link/consultation-shared-links/${consultation.id}`)
        .set('x-auth-token', customerAuthToken2)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toContain("User isn't belongs to consultation");
        });
    });
  });
});

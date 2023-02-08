import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Lawyer } from '../src/lawyer/entities/lawyer.entity';
import { Customer } from '../src/customer/customer.entity';
import { Feedback } from '../src/feedback/feedback.entity';
import { CreateFeedbackDTO } from '../src/feedback/dto/create-feedback.dto';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('FeedbackController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let lawyerRepository: Repository<Lawyer>;
  let feedbackRepository: Repository<Feedback>;
  let customer: Customer;
  let customer2: Customer;
  let lawyer: Lawyer;
  let feedback: Feedback;
  let createFeedbackBody: CreateFeedbackDTO;
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
    feedbackRepository = moduleFixture.get('FeedbackRepository');

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
    feedback = feedbackRepository.create({
      lawyer,
      customer,
      grade: 5,
      review: 'awesome',
    });
    feedback = await feedbackRepository.manager.save(feedback);
    createFeedbackBody = {
      lawyerId: lawyer.id,
      customerId: customer2.id,
      grade: 4,
      review: 'not bad',
    };
    customerAuthToken = jwtService.sign({
      email: customer.user.email,
      roles: customer.user.roles,
    });
    lawyerAuthToken = jwtService.sign({
      email: lawyer.user.email,
      roles: lawyer.user.roles,
    });
  });

  afterEach(async () => {
    customerAuthToken = undefined;
    lawyerAuthToken = undefined;
    await feedbackRepository.delete({ lawyer: { id: lawyer.id } });
  });

  describe("test 'get-lawyer-feedbacks' endpoint", () => {
    it('should return lawyer feedbacks', () => {
      return request(app.getHttpServer())
        .get(`/feedback/get-lawyer-feedbacks/${lawyer.id}?page=1&limit=6`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('grades');
          expect(body.grades).toHaveProperty('oneStars');
          expect(body.grades).toHaveProperty('twoStars');
          expect(body.grades).toHaveProperty('threeStars');
          expect(body.grades).toHaveProperty('fourStars');
          expect(body.grades).toHaveProperty('fiveStars');
          expect(body).toHaveProperty('reviews');
        });
    });

    it('should return bad request status', () => {
      return request(app.getHttpServer())
        .get('/feedback/get-lawyer-feedbacks/0')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return lawyer not found status', () => {
      return request(app.getHttpServer())
        .get('/feedback/get-lawyer-feedbacks/0?page=1&limit=6')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("test 'create-feedback' endpoint", () => {
    it('should create and return entity', () => {
      return request(app.getHttpServer())
        .post('/feedback/create-feedback')
        .set('x-auth-token', customerAuthToken)
        .send(createFeedbackBody)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('fullName');
          expect(body).toHaveProperty('avatar');
          expect(body).toHaveProperty('grade');
          expect(body).toHaveProperty('review');
          expect(body).toHaveProperty('createdAt');
        });
    });

    it('should return bad request status', () => {
      return request(app.getHttpServer())
        .post('/feedback/create-feedback')
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post('/feedback/create-feedback')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', () => {
      return request(app.getHttpServer())
        .post('/feedback/create-feedback')
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});

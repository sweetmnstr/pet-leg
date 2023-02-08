import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Lawyer } from '../src/lawyer/entities/lawyer.entity';
import { Customer } from '../src/customer/customer.entity';
import { Consultation } from '../src/consultation/consultation.entity';
import { TimeSlot } from '../src/schedule/entities/timeslot.entity';
import { UpdateCustomerProfileDTO } from '../src/customer/dto/update-customer-profile.dto';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('CustomerController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let lawyerRepository: Repository<Lawyer>;
  let consultationRepository: Repository<Consultation>;
  let timeslotRepository: Repository<TimeSlot>;
  let customer: Customer;
  let lawyer: Lawyer;
  let consultation: Consultation;
  let timeslot: TimeSlot;
  let updateCustomerProfileBody: UpdateCustomerProfileDTO;
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
    consultationRepository = moduleFixture.get('ConsultationRepository');
    timeslotRepository = moduleFixture.get('TimeSlotRepository');

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
    updateCustomerProfileBody = {
      firstName: faker.name.firstName(),
      password: '1111',
      timezone: faker.address.timeZone(),
      lastName: faker.name.lastName(),
      phone: faker.phone.number(),
      notificationFilters: '{"test": "data"}',
      photo:
        'https://lp-dev-s3.s3.amazonaws.com/64cea0e5-d884-44e3-b002-39aebf10bfaa-2022-08-24%2016.18.33.jpg',
    };
    const timezone = 'Europe/Kiev';
    timeslot = timeslotRepository.create({
      date: format(new Date(), 'yyyy-MM-dd'),
      startAt: '11:00',
      finishAt: '12:00',
    });
    timeslot = await timeslotRepository.manager.save(timeslot);
    consultation = consultationRepository.create({
      lawyer,
      customer,
      timeslots: [timeslot],
      communicationChannel: 'customer',
    });
    consultation = await consultationRepository.manager.save(consultation);
    customerAuthToken = jwtService.sign({
      customerId: customer.id,
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
    await timeslotRepository.delete({ id: timeslot.id });
    await consultationRepository.delete({ id: consultation.id });
  });

  describe("test 'get-customer-profile' endpoint", () => {
    it('should return customer profile', () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-profile`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('firstName');
          expect(body).toHaveProperty('lastName');
          expect(body).toHaveProperty('email');
          expect(body).toHaveProperty('timezone');
          expect(body).toHaveProperty('photo');
          expect(body).toHaveProperty('bindedSocials');
        });
    });

    it('should return customer not found', () => {
      customerAuthToken = jwtService.sign({
        customerId: 0,
        email: customer.user.email,
        roles: customer.user.roles,
      });
      return request(app.getHttpServer())
        .get('/customer/get-customer-profile')
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-profile`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("test 'update-customer-profile' endpoint", () => {
    it('should update and return ok status', () => {
      return request(app.getHttpServer())
        .patch(`/customer/update-customer-profile`)
        .set('x-auth-token', customerAuthToken)
        .send(updateCustomerProfileBody)
        .expect(HttpStatus.OK);
    });

    it('should return customer not found', () => {
      customerAuthToken = jwtService.sign({
        customerId: 0,
        email: customer.user.email,
        roles: customer.user.roles,
      });
      return request(app.getHttpServer())
        .patch('/customer/update-customer-profile')
        .set('x-auth-token', customerAuthToken)
        .send(updateCustomerProfileBody)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return bad request status', () => {
      return request(app.getHttpServer())
        .patch(`/customer/update-customer-profile`)
        .set('x-auth-token', customerAuthToken)
        .send({ email: 'asdasdasdsad' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .patch(`/customer/update-customer-profile`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .patch(`/customer/update-customer-profile`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'get-customer-consultations-list' endpoint", () => {
    it('should return a list of consultation', () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-consultations-list`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('consultations');
          body.consultations.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('lawyer');
            expect(item.lawyer).toHaveProperty('id');
            expect(item.lawyer).toHaveProperty('title');
            expect(item.lawyer).toHaveProperty('fullName');
            expect(item.lawyer).toHaveProperty('avatar');
            expect(item).toHaveProperty('conversationId');
            expect(item).toHaveProperty('status');
            expect(item).toHaveProperty('grade');
            expect(item).toHaveProperty('timeslots');
            item.timeslots.forEach((slot) => {
              expect(slot).toHaveProperty('id');
              expect(slot).toHaveProperty('date');
              expect(slot).toHaveProperty('startAt');
              expect(slot).toHaveProperty('finishAt');
            });
          });
        });
    });

    it('should return a list of consultation (test pagination)', () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-consultations-list?page=1&limit=5`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('consultations');
          body.consultations.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('lawyer');
            expect(item.lawyer).toHaveProperty('id');
            expect(item.lawyer).toHaveProperty('title');
            expect(item.lawyer).toHaveProperty('fullName');
            expect(item.lawyer).toHaveProperty('avatar');
            expect(item).toHaveProperty('status');
            expect(item).toHaveProperty('grade');
            expect(item).toHaveProperty('timeslots');
            item.timeslots.forEach((slot) => {
              expect(slot).toHaveProperty('id');
              expect(slot).toHaveProperty('date');
              expect(slot).toHaveProperty('startAt');
              expect(slot).toHaveProperty('finishAt');
            });
          });
        });
    });

    it('should return customer not found', () => {
      customerAuthToken = jwtService.sign({
        customerId: 0,
        email: customer.user.email,
        roles: customer.user.roles,
      });
      return request(app.getHttpServer())
        .get('/customer/get-customer-consultations-list')
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return errors', () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-consultations-list`)
        .set('x-auth-token', customerAuthToken)
        .query({
          date: '2022-02-21', // valid format
          dateEnd: '2022.02.21', // wrong format
          status: 'pending_', // not existing status
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-consultations-list`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(`/customer/get-customer-consultations-list`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});

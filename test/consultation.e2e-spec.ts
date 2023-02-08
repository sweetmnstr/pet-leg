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
import { Feedback } from '../src/feedback/feedback.entity';
import { Schedule } from '../src/schedule/entities/schedule.entity';
import { format } from 'date-fns';
import { CreateConsultationRequestDTO } from '../src/consultation/dto/create-consultation-request.dto';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('ConsultationController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let lawyerRepository: Repository<Lawyer>;
  let consultationRepository: Repository<Consultation>;
  let timeslotRepository: Repository<TimeSlot>;
  let feedbackRepository: Repository<Feedback>;
  let feedback: Feedback;
  let scheduleRepository: Repository<Schedule>;
  let customer: Customer;
  let lawyer: Lawyer;
  let consultation: Consultation;
  let timeslot: TimeSlot;
  let timeoff: TimeSlot;
  let schedule: Schedule;
  const timezone = 'Europe/Kiev';
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
    feedbackRepository = moduleFixture.get('FeedbackRepository');
    scheduleRepository = moduleFixture.get('ScheduleRepository');

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
    feedback = feedbackRepository.create({
      lawyer: { id: lawyer.id },
      customer: { id: customer.id },
      review: 'bla-bla',
      grade: 3.5,
    });
    feedback = await feedbackRepository.manager.save(feedback);
    schedule = await scheduleRepository.findOne({
      where: { lawyer: { id: lawyer.id } },
    });
    timeslot = timeslotRepository.create({
      date: format(new Date(), 'yyyy-MM-dd'),
      startAt: '10:00',
      finishAt: '11:00',
      schedule,
    });
    timeslot = await timeslotRepository.manager.save(timeslot);
    timeoff = timeslotRepository.create({
      dayOff: format(new Date(), 'EEEE').toLowerCase(),
      startAt: '19:00',
      finishAt: '20:00',
      schedule,
    });
    timeoff = await timeslotRepository.manager.save(timeoff);
    consultation = consultationRepository.create({
      lawyer,
      customer,
      timeslots: [timeslot],
      communicationChannel: 'consultation',
    });
    consultation = await consultationRepository.save(consultation);
    customerAuthToken = jwtService.sign({
      customerId: customer.id,
      email: customer.user.email,
      roles: customer.user.roles,
    });
    lawyerAuthToken = jwtService.sign({
      lawyerId: lawyer.id,
      email: lawyer.user.email,
      roles: lawyer.user.roles,
    });
  });

  afterEach(async () => {
    customerAuthToken = undefined;
    lawyerAuthToken = undefined;
    await timeslotRepository.delete({ id: timeoff.id });
    await timeslotRepository.delete({ consultation: { id: consultation.id } });
    await consultationRepository.delete({ id: consultation.id });
    await feedbackRepository.delete(feedback.id);
  });

  describe("test 'create-consultation-request' endpoint", () => {
    it('should create and return entity', async () => {
      const response = await request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: lawyer.id,
          customerId: customer.id,
          date: timeslot.date,
          startAt: '11:00',
          finishAt: '12:00',
          communicationChannel: 'createConsultationRequest',
          timezone,
        } as CreateConsultationRequestDTO);
      expect(response.statusCode).toEqual(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('customerId');
      expect(response.body).toHaveProperty('lawyerId');
      expect(response.body).toHaveProperty('communicationChannel');
      expect(response.body).toHaveProperty('timeslots');
      response.body.timeslots.forEach((timeslot) => {
        expect(timeslot).toHaveProperty('date');
        expect(timeslot).toHaveProperty('startAt');
        expect(timeslot).toHaveProperty('finishAt');
        expect(timeslot).toHaveProperty('timezone');
      });
      expect(response.body).toHaveProperty('status');
      await timeslotRepository.delete({
        consultation: { id: response.body.id },
      });
      await consultationRepository.delete({ id: response.body.id });
    });

    it('should return timezone is not exists', () => {
      request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: lawyer.id,
          customerId: customer.id,
          date: timeslot.date,
          startAt: '11:00',
          finishAt: '12:00',
          communicationChannel: 'createConsultationRequest',
          timezone: 'Europe/Kyiv',
        } as CreateConsultationRequestDTO)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request status', () => {
      return request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reutrn timeslot exists error', () => {
      return request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: lawyer.id,
          customerId: customer.id,
          date: timeslot.date,
          startAt: timeslot.startAt,
          finishAt: timeslot.finishAt,
        } as CreateConsultationRequestDTO)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return time slot is exists because lawyer set time off before', () => {
      return request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .set('x-auth-token', customerAuthToken)
        .send({
          lawyerId: lawyer.id,
          customerId: customer.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          startAt: timeoff.startAt,
          finishAt: timeoff.finishAt,
        } as CreateConsultationRequestDTO)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', () => {
      return request(app.getHttpServer())
        .post('/consultation/create-consultation-request')
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'reject-consultation' endpoint", () => {
    it('should create and return no content status', async () => {
      return request(app.getHttpServer())
        .post('/consultation/reject-consultation')
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: consultation.id })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad request status and consultation is not exists error', () => {
      return request(app.getHttpServer())
        .post('/consultation/reject-consultation')
        .set('x-auth-token', lawyerAuthToken)
        .send({ consultationId: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post('/consultation/reject-consultation')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("test 'reject-consultation' endpoint", () => {
    it('should create and return no content status', async () => {
      return request(app.getHttpServer())
        .post('/consultation/reject-consultation')
        .set('x-auth-token', lawyerAuthToken)
        .send({ consultationId: consultation.id })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad request status and consultation is not exists error', () => {
      return request(app.getHttpServer())
        .post('/consultation/reject-consultation')
        .set('x-auth-token', lawyerAuthToken)
        .send({ consultationId: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post('/consultation/reject-consultation')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("test 'reschedule' endpoint", () => {
    it('should update timeSlot and status to pending', async () => {
      return request(app.getHttpServer())
        .patch('/consultation/reschedule')
        .set('x-auth-token', customerAuthToken)
        .send({
          consultationId: consultation.id,
          date: '2024-10-09',
          startAt: '11:30',
          finishAt: '12:30',
          timezone,
        })
        .expect(200);
    });

    it('should return consultation not exists error', () => {
      return request(app.getHttpServer())
        .patch('/consultation/reschedule')
        .set('x-auth-token', customerAuthToken)
        .send({
          consultationId: 100,
          date: '2024-10-09',
          startAt: '11:30',
          finishAt: '12:30',
          timezone,
        })
        .expect(400);
    });

    it('should validate finishAt and startAt', async () => {
      return request(app.getHttpServer())
        .patch('/consultation/reschedule')
        .set('x-auth-token', customerAuthToken)
        .send({
          consultationId: consultation.id,
          date: '2024-10-09',
          startAt: '12:30',
          finishAt: '11:30',
          timezone,
        })
        .expect(400);
    });

    it('should return date in the past error and change consultation status to rejected', async () => {
      return request(app.getHttpServer())
        .patch('/consultation/reschedule')
        .set('x-auth-token', customerAuthToken)
        .send({
          consultationId: consultation.id,
          date: '2020-10-09',
          startAt: '11:30',
          finishAt: '12:30',
          timezone,
        })
        .expect(400);
    });
  });

  describe("test 'reviewed-consultation' endpoint", () => {
    it('should update and return no content status', () => {
      return request(app.getHttpServer())
        .post('/consultation/reviewed-consultation')
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: consultation.id, feedbackId: feedback.id })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return bad request status and consultation is not exists error', () => {
      return request(app.getHttpServer())
        .post('/consultation/reviewed-consultation')
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: 0, feedbackId: feedback.id })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request status and feedback is not exists error', async () => {
      return request(app.getHttpServer())
        .post('/consultation/reviewed-consultation')
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: consultation.id, feedbackId: 0 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return user is not belongs to consultation', async () => {
      customerAuthToken = jwtService.sign({
        customerId: 0,
        email: customer.user.email,
        roles: customer.user.roles,
      });
      return request(app.getHttpServer())
        .post('/consultation/reviewed-consultation')
        .set('x-auth-token', customerAuthToken)
        .send({ consultationId: consultation.id, feedbackId: feedback.id })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post('/consultation/reviewed-consultation')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', () => {
      return request(app.getHttpServer())
        .post('/consultation/reviewed-consultation')
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});

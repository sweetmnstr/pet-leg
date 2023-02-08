import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Lawyer } from '../src/lawyer/entities/lawyer.entity';
import { Schedule } from '../src/schedule/entities/schedule.entity';
import { TimeSlot } from '../src/schedule/entities/timeslot.entity';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';

describe('ScheduleController (e2e)', () => {
  let app: INestApplication;
  let lawyerRepository: Repository<Lawyer>;
  let scheduleRepository: Repository<Schedule>;
  let timeslotRepository: Repository<TimeSlot>;
  let lawyer: Lawyer;
  let schedule: Schedule;
  let timeslot1: TimeSlot;
  let timeslot2: TimeSlot;
  const timezone = 'Europe/Kiev';

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
    lawyerRepository = moduleFixture.get('LawyerRepository');
    scheduleRepository = moduleFixture.get('ScheduleRepository');
    timeslotRepository = moduleFixture.get('TimeSlotRepository');
    // setup data
    lawyer = await lawyerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'darrion@lawyer.com' } },
    });
    schedule = await scheduleRepository.findOne({
      where: { lawyer: { id: lawyer.id } },
    });
    timeslot1 = timeslotRepository.create({
      schedule,
      startAt: '10:00',
      finishAt: '11:00',
      date: '2015-03-25',
    });
    timeslot2 = timeslotRepository.create({
      schedule,
      startAt: '11:00',
      finishAt: '11:30',
      date: '2015-03-25',
    });
    timeslot1 = await timeslotRepository.manager.save(timeslot1);
    timeslot2 = await timeslotRepository.manager.save(timeslot2);
  });

  afterEach(async () => {
    await timeslotRepository.delete({ id: timeslot1.id });
    await timeslotRepository.delete({ id: timeslot2.id });
  });

  describe("test 'get-lawyer-schedule' endpoint", () => {
    it('should return lawyer schedule', () => {
      return request(app.getHttpServer())
        .get(`/schedule/get-lawyer-schedule`)
        .query({
          lawyerId: lawyer.id,
          date: timeslot1.date,
          timezone: 'Europe/Kiev',
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('timeslots');
        });
    });

    it('should return lawyer not found', () => {
      return request(app.getHttpServer())
        .get(`/schedule/get-lawyer-schedule`)
        .query({ lawyerId: 0, date: timeslot1.date, timezone: 'Europe/Kiev' })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('timeslots');
          expect(body.timeslots).toEqual([]);
        });
    });
  });
});

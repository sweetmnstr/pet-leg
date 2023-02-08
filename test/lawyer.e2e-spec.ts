import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { DeepPartial, Repository } from 'typeorm';
import { Lawyer } from '../src/lawyer/entities/lawyer.entity';
import { Customer } from '../src/customer/customer.entity';
import { Consultation } from '../src/consultation/consultation.entity';
import { TimeSlot } from '../src/schedule/entities/timeslot.entity';
import { format } from 'date-fns';
import { Report } from '../src/lawyer/entities/report.entity';
import { AmountOfConsultations } from '../src/lawyer/enums/amount-of-consultations.enum';
import { Gender } from '../src/lawyer/enums/gender.enum';
import { LawService } from '../src/lawyer/enums/law-service.enum';
import { PlaceOfResidence } from '../src/lawyer/enums/place-of-residence.enum';
import { StatusOfBenificiary } from '../src/lawyer/enums/status-of-benificiary.enum';
import { TypeOfAsstistance } from '../src/lawyer/enums/type-of-asstistance.enum';
import { RabbitMQ } from '../src/rabbitmq/rabbitmq-client.module';
import { Post } from '../src/post/post.entity';

describe('LawyerController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let customerRepository: Repository<Customer>;
  let lawyerRepository: Repository<Lawyer>;
  let consultationRepository: Repository<Consultation>;
  let timeslotRepository: Repository<TimeSlot>;
  let reportRepository: Repository<Report>;
  let postRepository: Repository<Post>;
  let customer: Customer;
  let lawyer: Lawyer;
  let consultation: Consultation;
  let timeslot: TimeSlot;
  let report: Report;
  let post: Post;
  const timeZone = 'Europe/Kiev';
  let customerAuthToken: string;
  let lawyerAuthToken: string;
  let createReportDto: DeepPartial<Report>;
  let updateReportDto: DeepPartial<Report>;

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
    reportRepository = moduleFixture.get('ReportRepository');
    postRepository = moduleFixture.get('PostRepository');

    // setup services
    jwtService = new JwtService({
      secretOrPrivateKey: process.env.JWT_SECRET,
    });

    // setup data
    updateReportDto = {
      name: 'test2',
      gender: Gender.FEMALE,
      phoneNumber: '+380973432723',
      statusOfBenificiary: StatusOfBenificiary.NON_IDP,
      age: 23,
      placeOfResidence: PlaceOfResidence.JYTOMYRSKA,
      date: '2022-10-02',
      lawService: LawService.BUSINESS_ISSUES,
      typeOfAsstistance: TypeOfAsstistance.ADMIN_SUPPORT,
      amountOfConsultation: AmountOfConsultations.TWO,
    };
    lawyer = await lawyerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'darrion@lawyer.com' } },
    });
    customer = await customerRepository.findOne({
      relations: { user: true },
      where: { user: { email: 'dariana@customer.com' } },
    });
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
      communicationChannel: 'lawyer',
    });
    consultation = await consultationRepository.manager.save(consultation);
    createReportDto = {
      name: 'test',
      gender: Gender.MALE,
      phoneNumber: '+380973456723',
      statusOfBenificiary: StatusOfBenificiary.IDP,
      age: 23,
      placeOfResidence: PlaceOfResidence.DNIPROPETROVSKA,
      date: '2022-10-02',
      lawService: LawService.BUSINESS_ISSUES,
      typeOfAsstistance: TypeOfAsstistance.ADMIN_SUPPORT,
      amountOfConsultation: AmountOfConsultations.ONE,
      consultation,
    };
    report = reportRepository.create(createReportDto);
    report = await reportRepository.manager.save(report);
    post = postRepository.create({
      title: "Lawyer's post title",
      content: "Lawyer's post content...",
      createdBy: lawyer.user,
    });
    post = await postRepository.manager.save(post);

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
    await postRepository.delete({ id: post.id });
    await reportRepository.delete({ id: report.id });
    await timeslotRepository.delete({ id: timeslot.id });
    await consultationRepository.delete({ id: consultation.id });
  });

  describe("test 'get-lawyer-profile' endpoint", () => {
    it('should return lawyer profile', async () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-profile/?lawyerId=${lawyer.id}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('introVideo');
          expect(body).toHaveProperty('firstName');
          expect(body).toHaveProperty('lastName');
          expect(body).toHaveProperty('title');
          expect(body).toHaveProperty('legalAreas');
          expect(body).toHaveProperty('language');
          expect(body).toHaveProperty('country');
          expect(body).toHaveProperty('city');
          expect(body).toHaveProperty('description');
          expect(body).toHaveProperty('experienceTime');
          expect(body).toHaveProperty('profileImage');
          expect(body).toHaveProperty('isVerified');
          expect(body).toHaveProperty('consultationsCount');
          expect(body).toHaveProperty('resume');
        });
    });

    it('should return lawyer not found', async () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-profile/?lawyerId=0`)
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body).toHaveProperty('message');
          expect(body.message).toBe('Lawyer not found');
        });
    });
  });

  describe("test 'get-lawyers-list' endpoint", () => {
    it('should return list of lawyers without filters', () => {
      const search = lawyer.user.firstName;
      const page = 1;
      const lawyersForPage = 1;
      const filters = 'experienceTime:{0-100}';

      const queryString = `/lawyer/get-lawyers-list/?search=${search}&page=${page}&lawyersForPage=${lawyersForPage}&filters=${filters}`;
      return request(app.getHttpServer())
        .get(queryString)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('lawyersList');
          expect(body).toHaveProperty('total');
          expect(body.lawyersList.length).toBe(lawyersForPage);
          expect(body.total).toBe(lawyersForPage);
          expect(body.lawyersList[0]).toHaveProperty('introVideo');
          expect(body.lawyersList[0]).toHaveProperty('firstName');
          expect(body.lawyersList[0]).toHaveProperty('lastName');
          expect(body.lawyersList[0]).toHaveProperty('title');
          expect(body.lawyersList[0]).toHaveProperty('legalAreas');
          expect(body.lawyersList[0]).toHaveProperty('language');
          expect(body.lawyersList[0]).toHaveProperty('country');
          expect(body.lawyersList[0]).toHaveProperty('city');
          expect(body.lawyersList[0]).toHaveProperty('description');
          expect(body.lawyersList[0]).toHaveProperty('experienceTime');
          expect(body.lawyersList[0]).toHaveProperty('profileImage');
          expect(body.lawyersList[0]).toHaveProperty('isVerified');
          expect(body.lawyersList[0]).toHaveProperty('consultationsCount');
          expect(body.lawyersList[0]).toHaveProperty('resume');
          expect(body.lawyersList[0]).toHaveProperty('totalReviews');
          expect(body.lawyersList[0]).toHaveProperty('averageGrade');
          expect(body.lawyersList[0].firstName).toBe(search);
        });
    });

    it('should return list of lawyers with multiple filters', () => {
      const search = lawyer.user.lastName;
      const page = 1;
      const lawyersForPage = 1;
      const filters =
        'specialization:{internallyDisplacedPersons,employmentIssues};country:{ukraine};experienceTime:{1-4}';

      const queryString = `/lawyer/get-lawyers-list/?search=${search}&page=${page}&lawyersForPage=${lawyersForPage}&filters=${filters}`;
      return request(app.getHttpServer())
        .get(queryString)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('lawyersList');
          expect(body).toHaveProperty('total');
          expect(body.lawyersList.length).toBe(lawyersForPage);
          expect(body.total).toBe(lawyersForPage);
          expect(body.lawyersList[0]).toHaveProperty('introVideo');
          expect(body.lawyersList[0]).toHaveProperty('firstName');
          expect(body.lawyersList[0]).toHaveProperty('lastName');
          expect(body.lawyersList[0]).toHaveProperty('title');
          expect(body.lawyersList[0]).toHaveProperty('legalAreas');
          expect(body.lawyersList[0]).toHaveProperty('language');
          expect(body.lawyersList[0]).toHaveProperty('country');
          expect(body.lawyersList[0]).toHaveProperty('city');
          expect(body.lawyersList[0]).toHaveProperty('description');
          expect(body.lawyersList[0]).toHaveProperty('experienceTime');
          expect(body.lawyersList[0]).toHaveProperty('profileImage');
          expect(body.lawyersList[0]).toHaveProperty('isVerified');
          expect(body.lawyersList[0]).toHaveProperty('consultationsCount');
          expect(body.lawyersList[0]).toHaveProperty('resume');
          expect(body.lawyersList[0].lastName).toBe(search);
          expect(body.lawyersList[0].country).toBe('Ukraine');
          expect(body.lawyersList[0]).toHaveProperty('totalReviews');
          expect(body.lawyersList[0]).toHaveProperty('averageGrade');
          expect(body.lawyersList[0].experienceTime).toBe(1 || 2);
        });
    });

    it('should return list of lawyers with empty search param', () => {
      const search = '';
      const page = 1;
      const lawyersForPage = 1;
      const filters = 'experienceTime:{0-100}';

      const queryString = `/lawyer/get-lawyers-list/?search=${search}&page=${page}&lawyersForPage=${lawyersForPage}&filters=${filters}`;
      return request(app.getHttpServer())
        .get(queryString)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('lawyersList');
          expect(body).toHaveProperty('total');
          expect(body.lawyersList.length).toBe(lawyersForPage);
          expect(body.lawyersList[0]).toHaveProperty('introVideo');
          expect(body.lawyersList[0]).toHaveProperty('firstName');
          expect(body.lawyersList[0]).toHaveProperty('lastName');
          expect(body.lawyersList[0]).toHaveProperty('title');
          expect(body.lawyersList[0]).toHaveProperty('legalAreas');
          expect(body.lawyersList[0]).toHaveProperty('language');
          expect(body.lawyersList[0]).toHaveProperty('country');
          expect(body.lawyersList[0]).toHaveProperty('city');
          expect(body.lawyersList[0]).toHaveProperty('description');
          expect(body.lawyersList[0]).toHaveProperty('experienceTime');
          expect(body.lawyersList[0]).toHaveProperty('profileImage');
          expect(body.lawyersList[0]).toHaveProperty('isVerified');
          expect(body.lawyersList[0]).toHaveProperty('consultationsCount');
          expect(body.lawyersList[0]).toHaveProperty('resume');
          expect(body.lawyersList[0]).toHaveProperty('totalReviews');
          expect(body.lawyersList[0]).toHaveProperty('averageGrade');
        });
    });

    it('should return empty list of lawyers with language filter', () => {
      const search = lawyer.user.lastName + ' NOT EXISTING LAST NAME';
      const page = 1;
      const lawyersForPage = 1;
      const filters =
        'specialization:{internallyDisplacedPersons};country:{denmark};experienceTime:{1-4}';

      const queryString = `/lawyer/get-lawyers-list/?search=${search}&page=${page}&lawyersForPage=${lawyersForPage}&filters=${filters}`;
      return request(app.getHttpServer())
        .get(queryString)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('lawyersList');
          expect(body).toHaveProperty('total');
          expect(body.lawyersList.length).toBe(0);
          expect(body.total).toBe(0);
        });
    });
  });

  describe('test `update-lawyer-feedbacks-visibility` endpoint', () => {
    it('should update hideFeedback status return no content', async () => {
      return request(app.getHttpServer())
        .put('/lawyer/update-lawyer-feedbacks-visibility')
        .set('x-auth-token', lawyerAuthToken)
        .send({
          lawyerId: lawyer.id,
          hideFeedbacks: true,
        })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return lawyer not found status', () => {
      return request(app.getHttpServer())
        .put('/lawyer/update-lawyer-feedbacks-visibility')
        .set('x-auth-token', lawyerAuthToken)
        .send({
          lawyerId: 0,
          hideFeedbacks: true,
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return bad request status', () => {
      return request(app.getHttpServer())
        .put('/lawyer/update-lawyer-feedbacks-visibility')
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .put('/lawyer/update-lawyer-feedbacks-visibility')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', () => {
      return request(app.getHttpServer())
        .put('/lawyer/update-lawyer-feedbacks-visibility')
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'getLawyersListFilters' endpoint", () => {
    it('should return all available lawyers filters', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyers-list-filters`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('filters');
          expect(body.filters).toHaveLength(2);
          expect(body.filters[0]).toHaveProperty('filterName');
          expect(body.filters[0]).toHaveProperty('filterValues');
          expect(body.filters[0]).toHaveProperty('filterLocales');
          expect(body.filters[0].filterLocales).toHaveProperty('en');
          expect(body.filters[0].filterLocales).toHaveProperty('uk');
          expect(body.filters[1]).toHaveProperty('filterName');
          expect(body.filters[1]).toHaveProperty('filterValues');
          expect(body.filters[1]).toHaveProperty('filterLocales');
          expect(body.filters[1].filterLocales).toHaveProperty('en');
          expect(body.filters[1].filterLocales).toHaveProperty('uk');
        });
    });
  });

  describe("test 'get-lawyer-geolocation' endpoint", () => {
    it('should return lawyer geolocation', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-geolocation/${lawyer.id}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('longitude');
          expect(body).toHaveProperty('latitude');
        });
    });

    it('should return not found status', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-geolocation/0`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("test 'getLawyerCasesList' endpoint", () => {
    it('should return a list of cases', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-cases-list/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('consultationsGroups');
        });
    });

    it('should return a list of cases (test pagination)', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-cases-list/${lawyer.id}?page=1&limit=5`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('consultationsGroups');
        });
    });

    it('should return lawyer not found', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-cases-list/0`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual('Lawyer not found');
        });
    });

    it('should return errors', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-cases-list/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .query({
          date: '2022-02-21', // valid format
          dateEnd: '2022.02.21', // wrong format
          status: 'pending_', // not existing status
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-cases-list/${lawyer.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-lawyer-cases-list/${lawyer.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'setTimeoffs' endpoint", () => {
    it('should create abd return lawyer timeoffs', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lawyer/set-timeoffs/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .send({
          timeoffs: [
            {
              day: format(new Date(), 'EEEE').toLowerCase(),
              startAt: '20:00',
              finishAt: '23:59',
            },
          ],
        });
      expect(response.statusCode).toEqual(HttpStatus.CREATED);
      response.body.forEach((item) => {
        expect(item).toHaveProperty('day');
        expect(item).toHaveProperty('startAt');
        expect(item).toHaveProperty('finishAt');
      });
      await timeslotRepository.delete({
        dayOff: response.body[0].day,
        startAt: response.body[0].startAt,
        finishAt: response.body[0].finishAt,
      });
    });

    it('should return errors', async () => {
      return request(app.getHttpServer())
        .post(`/lawyer/set-timeoffs/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .send({ timeoffs: [{}] })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/set-timeoffs/${lawyer.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .post(`/lawyer/set-timeoffs/${lawyer.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'set-availability' endpoint", () => {
    it('should create abd return lawyer availability', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lawyer/set-availability/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .send({
          availability: [
            {
              startAt: '20:00',
              finishAt: '23:59',
            },
          ],
        });
      expect(response.statusCode).toEqual(HttpStatus.CREATED);
      response.body.forEach((item) => {
        expect(item).toHaveProperty('startAt');
        expect(item).toHaveProperty('finishAt');
      });
      await timeslotRepository.delete({
        dayOff: response.body[0].day,
        startAt: response.body[0].startAt,
        finishAt: response.body[0].finishAt,
      });
    });

    it('should return errors', async () => {
      return request(app.getHttpServer())
        .post(`/lawyer/set-availability/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .send({ availability: [{}] })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/set-availability/${lawyer.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .post(`/lawyer/set-availability/${lawyer.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'report' endpoints", () => {
    it('should add report', async () => {
      await reportRepository.delete({ id: report.id });
      return request(app.getHttpServer())
        .post(`/lawyer/add-report-info/${consultation.id}`)
        .set('x-auth-token', customerAuthToken)
        .send(createReportDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('name');
          expect(body).toHaveProperty('gender');
          expect(body).toHaveProperty('age');
          expect(body).toHaveProperty('phoneNumber');
          expect(body).toHaveProperty('statusOfBenificiary');
          expect(body).toHaveProperty('placeOfResidence');
          expect(body).toHaveProperty('clientOther');
          expect(body).toHaveProperty('date');
          expect(body).toHaveProperty('lawService');
          expect(body).toHaveProperty('caseOther');
          expect(body).toHaveProperty('typeOfAsstistance');
          expect(body).toHaveProperty('amountOfConsultation');
          expect(body).toHaveProperty('moreDetails');
          report.id = body.id;
        });
    });

    it('should fail addition', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/add-report-info/0`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should get report', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-report-info/${report.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('name');
          expect(body).toHaveProperty('gender');
          expect(body).toHaveProperty('age');
          expect(body).toHaveProperty('phoneNumber');
          expect(body).toHaveProperty('statusOfBenificiary');
          expect(body).toHaveProperty('placeOfResidence');
          expect(body).toHaveProperty('clientOther');
          expect(body).toHaveProperty('date');
          expect(body).toHaveProperty('lawService');
          expect(body).toHaveProperty('caseOther');
          expect(body).toHaveProperty('typeOfAsstistance');
          expect(body).toHaveProperty('amountOfConsultation');
          expect(body).toHaveProperty('moreDetails');
        });
    });

    it('should not get report', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-report-info/0`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should update report', () => {
      return request(app.getHttpServer())
        .patch(`/lawyer/edit-report-info/${report.id}`)
        .set('x-auth-token', customerAuthToken)
        .send(updateReportDto)
        .expect(HttpStatus.OK);
    });

    it('should not update report', () => {
      return request(app.getHttpServer())
        .patch(`/lawyer/edit-report-info/0`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should delete report', () => {
      return request(app.getHttpServer())
        .delete(`/lawyer/delete-report-info/${report.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK);
    });
  });

  it('should not delete report', () => {
    return request(app.getHttpServer())
      .delete(`/lawyer/delete-report-info/0`)
      .set('x-auth-token', customerAuthToken)
      .expect(HttpStatus.BAD_REQUEST);
  });

  describe("test 'get-posts' endpoint", () => {
    it('should return a list of posts', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-posts/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('posts');
          body.posts.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('createdAt');
            expect(item).toHaveProperty('status');
            expect(item).toHaveProperty('thumbnails');
          });
        });
    });

    it('should return a list of posts (test pagination)', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-posts/${lawyer.id}?page=1&limit=5`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('total');
          expect(body).toHaveProperty('posts');
          body.posts.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('createdAt');
            expect(item).toHaveProperty('status');
            expect(item).toHaveProperty('thumbnails');
          });
        });
    });

    it('should return lawyer not found', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-posts/0`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual('Lawyer not found');
        });
    });

    it('should return errors', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-posts/${lawyer.id}`)
        .set('x-auth-token', lawyerAuthToken)
        .query({
          date: '2022-02-21', // valid format
          dateEnd: '2022.02.21', // wrong format
          status: 'pending_', // not existing status
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-posts/${lawyer.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-posts/${lawyer.id}`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'get-post' endpoint", () => {
    it('should return a post', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-post`)
        .query({ lawyerId: lawyer.id, postId: post.id })
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('title');
          expect(body).toHaveProperty('tags');
          expect(body).toHaveProperty('content');
          expect(body).toHaveProperty('status');
          expect(body).toHaveProperty('thumbnails');
          expect(body).toHaveProperty('createdAt');
          expect(body).toHaveProperty('enableComments');
        });
    });

    it('should return post not found', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-post`)
        .query({ lawyerId: lawyer.id, postId: 0 })
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual('Post not found');
        });
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-post`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(`/lawyer/get-post`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'create-post' endpoint", () => {
    it('should create a post', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lawyer/create-post`)
        .set('x-auth-token', lawyerAuthToken)
        .send({
          lawyerId: lawyer.id,
          title: 'Title: should create a post',
          content: 'Content...',
          tags: [],
          thumbnails: ['https://google.com'],
          enableComments: false,
        });
      expect(response.statusCode).toEqual(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('tags');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('thumbnails');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('enableComments');
      await postRepository.delete({
        id: response.body.id,
      });
    });

    it('should return lawyer not found', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/create-post`)
        .set('x-auth-token', lawyerAuthToken)
        .send({
          lawyerId: 0,
          title: 'Title: should return lawyer not found',
          content: 'Content...',
          enableComments: true,
          tags: [],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual('Lawyer not found');
        });
    });

    it('should return errors', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/create-post`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/create-post`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', () => {
      return request(app.getHttpServer())
        .post(`/lawyer/create-post`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'update-post' endpoint", () => {
    it('should update a post', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/lawyer/update-post`)
        .set('x-auth-token', lawyerAuthToken)
        .send({
          lawyerId: lawyer.id,
          postId: post.id,
          title: 'Title: should update a post',
          content: 'Updated Content...',
          tags: ['Business'],
          thumbnails: [],
          enableComments: true,
        });
      expect(response.statusCode).toEqual(HttpStatus.NO_CONTENT);
    });

    it('should return post not found', () => {
      return request(app.getHttpServer())
        .patch(`/lawyer/update-post`)
        .set('x-auth-token', lawyerAuthToken)
        .send({
          postId: 0,
          lawyerId: lawyer.id,
          title: 'Title: should return post not found',
          content: 'Content...',
          enableComments: true,
          tags: [],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual('Post not found');
        });
    });

    it('should return errors', () => {
      return request(app.getHttpServer())
        .patch(`/lawyer/update-post`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .patch(`/lawyer/update-post`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', () => {
      return request(app.getHttpServer())
        .patch(`/lawyer/update-post`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("test 'delete-post' endpoint", () => {
    it('should delete a post', () => {
      return request(app.getHttpServer())
        .delete(`/lawyer/delete-post`)
        .query({ lawyerId: lawyer.id, postId: post.id })
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return post not found', () => {
      return request(app.getHttpServer())
        .delete(`/lawyer/delete-post`)
        .query({ lawyerId: lawyer.id, postId: 0 })
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.message).toEqual('Post not found');
        });
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .delete(`/lawyer/delete-post`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .delete(`/lawyer/delete-post`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe("test 'get-blog-posts' endpoint", () => {
    it('should return a list of posts', () => {
      return request(app.getHttpServer())
        .get(`/post/get-blog-posts?limit=5`)
        .set('x-auth-token', customerAuthToken)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body[0]).toHaveProperty('title');
          expect(body[0]).toHaveProperty('subtitle');
          body[0].posts.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('createdAt');
            expect(item).toHaveProperty('status');
            expect(item).toHaveProperty('thumbnails');
          });
        });
    });

    it('should return unauthorized status', () => {
      return request(app.getHttpServer())
        .get(`/post/get-blog-posts?limit=5`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return forbiden status', async () => {
      return request(app.getHttpServer())
        .get(`/post/get-blog-posts?limit=5`)
        .set('x-auth-token', lawyerAuthToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});

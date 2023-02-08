import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Lawyer } from './entities/lawyer.entity';
import { LawyerProfileDto } from './dto/lawyer-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetListDto } from './dto/get-list.dto';
import { LawyerFiltersService } from './lawyer-filters.service';
import { Geolocation } from '../geolocation/geolocation.entity';
import { AddReportInfoDTO } from './dto/add-report-Info.dto';
import { EditReportInfoDTO } from './dto/edit-report-info.dto';
import { Report } from './entities/report.entity';
import { ConsultationService } from '../consultation/consultation.service';
import { GetConsultationQueryDTO } from '../consultation/dto/get-consultation-query.dto';
import { Consultation } from '../consultation/consultation.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { FeedbackService } from '../feedback/feedback.service';
import { ScheduleService } from '../schedule/schedule.service';
import { TimeSlot } from '../schedule/entities/timeslot.entity';
import { format, subWeeks, addDays } from 'date-fns';
import { GetPostsQueryDTO } from './dto/get-posts.dto';
import { Post } from '../post/post.entity';
import { PostStatuses } from '../post/enums/post-statuses.enum';
import { PostService } from '../post/post.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { Countries } from './enums/countries.enum';
import { Sorts } from './enums/sorts.enum';
import { IORedisKey } from '../redis/redis.module';
import { UserRoles } from '../user/enums/user-roles.enum';
import { UpdateLawyerSettingsDTO } from './dto/update-lawyer-settings.dto';
import { UserService } from '../user/user.service';
import { CreateLawyerDto } from './dto/create-lawyer-dto';
import { LegalAreas } from './enums/legalAreas.enum';
import { GetLawyersByGeolocationDTO } from './dto/get-lawyers-by-geolocation.dto';
import { User } from '../user/user.entity';
import { columnStyles } from './common/column.style';
import { ReportLocales } from './locales/report.locales';
import * as excel from 'node-excel-export';
import { GeolocationService } from '../geolocation/geolocation.service';

@Injectable()
export class LawyerService extends TypeOrmCrudService<Lawyer> {
  constructor(
    @InjectRepository(Lawyer)
    private lawyerRepository: Repository<Lawyer>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private readonly lawyerFiltersService: LawyerFiltersService,
    @Inject(forwardRef(() => ConsultationService))
    private readonly consultationService: ConsultationService,
    @Inject(forwardRef(() => FavoriteService))
    private favoriteService: FavoriteService,
    @Inject(forwardRef(() => FeedbackService))
    private feedbackService: FeedbackService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private readonly sheduleService: ScheduleService,
    @InjectRepository(TimeSlot)
    private timeslotRepository: Repository<TimeSlot>,
    @Inject(IORedisKey)
    private readonly redisCache,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly postService: PostService,
    @Inject(forwardRef(() => GeolocationService))
    protected readonly geolocationService: GeolocationService,
  ) {
    super(lawyerRepository);
  }

  async createLawyer(createLawyer: CreateLawyerDto): Promise<Lawyer> {
    const insertResult = await this.lawyerRepository.insert(createLawyer);

    const [lawyer] = insertResult.raw;

    return lawyer;
  }

  async getLawyerGeolocation(id: number): Promise<Geolocation> {
    const relations = {
      geolocation: true,
    };
    const lawyer = await this.getLawyer(id, relations);
    if (!lawyer) throw new NotFoundException('Lawyer not found');
    if (!lawyer.geolocation)
      throw new BadRequestException('Geolocation is not exists');

    return lawyer.geolocation;
  }

  async updateLawyerSettings(
    id: number,
    updateLawyerSettingsDTO: UpdateLawyerSettingsDTO,
  ): Promise<LawyerProfileDto> {
    const targetLawyer = await this.lawyerRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });

    const { user } = targetLawyer;

    if (updateLawyerSettingsDTO.password) {
      await this.userService.updatePassword(
        user.id,
        updateLawyerSettingsDTO.password,
      );
      delete updateLawyerSettingsDTO.password;
    }

    if (updateLawyerSettingsDTO.geolocation) {
      await this.geolocationService.updateGeolocationOrCreate(
        targetLawyer,
        updateLawyerSettingsDTO.geolocation,
      );
    }

    const userUpdateDTO = {
      firstName: updateLawyerSettingsDTO.firstName,
      lastName: updateLawyerSettingsDTO.lastName,
      phone: updateLawyerSettingsDTO.phone,
    };

    const lawyerUpdateDTO = {
      country: updateLawyerSettingsDTO.country,
      city: updateLawyerSettingsDTO.city,
      specialization: updateLawyerSettingsDTO.specialization,
      profileImage: updateLawyerSettingsDTO.profileImage,
      experienceTime: updateLawyerSettingsDTO.experienceTime,
      certifications:
        updateLawyerSettingsDTO.certifications === null
          ? null
          : updateLawyerSettingsDTO.certifications?.map((certification) => ({
              ...certification,
              isVerified: undefined,
            })),
      education:
        updateLawyerSettingsDTO.education === null
          ? null
          : updateLawyerSettingsDTO.education?.map((education) => ({
              ...education,
              isVerified: undefined,
            })),
      workExperience:
        updateLawyerSettingsDTO.workExperience === null
          ? null
          : updateLawyerSettingsDTO.workExperience?.map((position) => ({
              ...position,
              isVerified: undefined,
            })),
      title: updateLawyerSettingsDTO.title,
      description: updateLawyerSettingsDTO.description,
      introVideo: updateLawyerSettingsDTO.introVideo,
      introVideoThumbnail: updateLawyerSettingsDTO.introVideoThumbnail,
    };

    await this.userService.updateUser(user.id, userUpdateDTO);
    await this.lawyerRepository.update(id, lawyerUpdateDTO);

    const lawyer = await this.getLawyer(id, { geolocation: true });

    return this.getLawyerSettings(lawyer);
  }

  async updateFeedbacksVisibility(
    id: number,
    hideFeedbacks: boolean,
  ): Promise<Lawyer> {
    const lawyer = await this.getLawyer(id);
    lawyer.hideFeedbacks = hideFeedbacks;
    return await this.lawyerRepository.save(lawyer);
  }

  async isLawyerFeedbacksHidden(lawyerId: number): Promise<boolean> {
    const lawyer = await this.getLawyer(lawyerId);

    return lawyer.hideFeedbacks;
  }

  async isLawyerExists(id: number): Promise<boolean> {
    return !!(await this.lawyerRepository.findOne({ where: { id } }));
  }

  async getLawyer(id: number, relations = {}): Promise<Lawyer> {
    const foundLawyer = await this.lawyerRepository.findOne({
      where: { id },
      relations: {
        user: true,
        ...relations,
      },
    });

    return foundLawyer;
  }

  async getLawyerProfile(lawyer: Lawyer): Promise<LawyerProfileDto> {
    const consultationsCount =
      await this.consultationService.getLawyerConsultationsCount(lawyer.id);

    const { averageGrade, reviews } =
      await this.feedbackService.getLawyerFeedbacks(lawyer.id, {});

    return {
      id: lawyer.id,
      introVideo: lawyer.introVideo,
      firstName: lawyer.user?.firstName,
      lastName: lawyer.user?.lastName,
      email: lawyer.user?.email,
      title: lawyer.title,
      legalAreas: lawyer.legalAreas,
      language: lawyer.language,
      country: lawyer.country
        ? lawyer.country[0].toUpperCase() + lawyer.country.slice(1)
        : null,
      city: lawyer.city,
      description: lawyer.description,
      experienceTime: lawyer.experienceTime,
      profileImage: lawyer.profileImage,
      isVerified: lawyer.isVerified,
      consultationsCount,
      resume: {
        education: lawyer.education,
        workExperience: lawyer.workExperience,
        certifications: lawyer.certifications,
      },
      totalReviews: reviews.length,
      averageGrade,
      introVideoThumbnail: lawyer.introVideoThumbnail,
    };
  }

  async getLawyerSettings(lawyer: Lawyer): Promise<LawyerProfileDto> {
    const lawyerProfile = await this.getLawyerProfile(lawyer);

    return {
      ...lawyerProfile,
      email: lawyer.user?.email,
      phone: lawyer.user?.phone,
      specialization: lawyer.specialization,
      geolocation: lawyer.geolocation,
    };
  }

  async getLawyerIdsFromSessions() {
    const sessions = await this.redisCache.keys('*');

    return sessions.reduce((filtered, session) => {
      const splitedSession = session.split('_');
      if (splitedSession[0] === UserRoles.Lawyer) {
        filtered.push(+splitedSession[2]);
      }
      return filtered;
    }, []);
  }

  async getLawyersProfilesOniline(): Promise<LawyerProfileDto[]> {
    const lawyersProfiles: LawyerProfileDto[] = [];

    const lawyerIds = await this.getLawyerIdsFromSessions();

    for (const lawyerId of lawyerIds) {
      const lawyer = await this.lawyerRepository.findOne({
        where: { id: lawyerId },
        relations: { user: true },
      });
      const lawyerProfle = await this.getLawyerProfile(lawyer);
      lawyersProfiles.push(lawyerProfle);
    }

    return lawyersProfiles
      .sort(
        (a: LawyerProfileDto, b: LawyerProfileDto) =>
          a.averageGrade - b.averageGrade,
      )
      .reverse();
  }

  async getRecommendedLawyers(
    legalArea: LegalAreas,
    limit: number,
  ): Promise<LawyerProfileDto[]> {
    const lawyersProfiles: LawyerProfileDto[] = [];

    const lawyers = await this.lawyerRepository.find({
      where: { legalAreas: legalArea },
      take: limit || 20,
    });
    for (const lawyer of lawyers) {
      const lawyerProfle = await this.getLawyerProfile(lawyer);
      lawyersProfiles.push(lawyerProfle);
    }

    return lawyersProfiles
      .sort(
        (a: LawyerProfileDto, b: LawyerProfileDto) =>
          a.averageGrade - b.averageGrade,
      )
      .reverse();
  }

  async getLawyersList(
    getList: GetListDto,
  ): Promise<{ lawyersList: LawyerProfileDto[]; total: number }> {
    const { filters, search, sortBy, lawyersForPage, page } = getList;

    const { formattedFilters } = this.getFormattedFilters(filters);
    await this.validateFilters(formattedFilters);

    let query = this.lawyerRepository
      .createQueryBuilder('lawyer')
      .leftJoinAndSelect('lawyer.user', 'user')
      .where('"experienceTime" >= :start', {
        start: formattedFilters?.experienceTime?.start || 0,
      })
      .andWhere('lawyer.isVerified = true')
      .andWhere('"experienceTime" < :end', {
        end: formattedFilters?.experienceTime?.end || 1000,
      })
      .skip(lawyersForPage * (page - 1))
      .take(lawyersForPage);

    const searchInLowCase = search.toLowerCase();
    const countrySearch = Countries[searchInLowCase];
    query =
      searchInLowCase === ''
        ? query
        : query.andWhere(
            `LOWER(user.firstName) = :firstName
                OR LOWER(user.lastName) = :lastName
                OR country = :countrySearch`,
            {
              firstName: searchInLowCase,
              lastName: searchInLowCase,
              countrySearch,
            },
          );

    const { specialization, country } = formattedFilters;
    if (specialization) {
      query = query.andWhere('specialization && :specialization', {
        specialization,
      });
    }
    if (country) {
      query = query.andWhere('country IN (:...country)', {
        country,
      });
    }

    if (
      formattedFilters?.availability &&
      formattedFilters?.availability[0] === 'online'
    ) {
      const ids = await this.getLawyerIdsFromSessions();
      query = query.andWhere('lawyer.id IN (:...ids)', { ids });
    }

    const [result, total] = await query
      .orderBy('lawyer.experienceTime', 'DESC')
      .getManyAndCount();

    if (result.length >= 500)
      throw new BadRequestException('Unhandled lawyers amount');

    const lawyersList = [];
    for await (const lawyer of result) {
      lawyersList.push(await this.getLawyerProfile(lawyer));
    }

    if (sortBy) {
      switch (sortBy) {
        case Sorts.Popularity:
          lawyersList.sort((a, b) => b.totalReviews - a.totalReviews);
          break;
        case Sorts.ConsultationsCount:
          lawyersList.sort(
            (a, b) => b.consultationsCount - a.consultationsCount,
          );
          break;
        default:
          break;
      }
    }
    return { lawyersList, total };
  }

  getFormattedFilters(filters: string): {
    formattedFilters: Record<string, any>;
  } {
    const formattedFilters = {};
    const splittedFilters = filters.split(';');
    const blackListFilters = ['city'];

    splittedFilters
      .filter((filter) =>
        blackListFilters.reduce(
          (res, blackListValue) => res && !filter.includes(blackListValue),
          true,
        ),
      )
      .forEach((filter) => {
        const [filterName, filterValues] = filter.split(':');

        if (filterName === 'availability') {
          formattedFilters[filterName] = [filterValues];
        } else {
          formattedFilters[filterName] = [
            ...filterValues.substr(1, filterValues.length - 2).split(','),
          ];

          if (filterName === 'experienceTime') {
            const [start, end] = formattedFilters[filterName][0].split('-');
            formattedFilters[filterName] = {
              start: +start,
              end: +end,
            };
          }
        }
      });

    return { formattedFilters };
  }

  async validateFilters(filters: Record<string, any>): Promise<void> {
    const availableFilters =
      await this.lawyerFiltersService.getLawyersListFilters();
    for (const item in filters) {
      if (item !== 'experienceTime' && item !== 'city') {
        const foundFilter = availableFilters.find(
          (avFilter) => avFilter.filterName === item,
        );
        if (!foundFilter) {
          throw new NotFoundException(`Filter category ${item} is not found`);
        }

        filters[item].forEach((filterValue) => {
          const foundValue = foundFilter.filterValues.find(
            (value) => value === filterValue,
          );
          if (!foundValue) {
            throw new NotFoundException(
              `Filter value ${filterValue} is not found`,
            );
          }
        });
      }

      if (filters.experienceTime.start > filters.experienceTime.end) {
        throw new NotFoundException('Bad defined time interval');
      }
    }
  }
  async matchLawyerByUserId(id: number): Promise<boolean> {
    const lawyer = await this.lawyerRepository.findOne({
      where: {
        user: { id },
      },
    });

    return !!lawyer;
  }

  async matchReportById(consultationId: number) {
    const report = await this.reportRepository.findOne({
      where: {
        consultation: { id: consultationId },
      },
    });

    return !!report;
  }

  async addReportInfo(
    consultationId: number,
    addReportInfoDTO: AddReportInfoDTO,
  ) {
    const consultation = await this.consultationService.getConsultation(
      consultationId,
    );
    if (!consultation) {
      throw new BadRequestException('INVALID_CONSULTATION_ID');
    }
    const { identifiers } = await this.reportRepository.insert({
      ...addReportInfoDTO,
      consultation,
    });
    return this.reportRepository.findOne({ where: { id: identifiers[0].id } });
  }

  async editReportInfo(
    consultationId: number,
    editReportInfoDTO: EditReportInfoDTO,
  ) {
    const isReport = await this.matchReportById(consultationId);
    if (!isReport) {
      throw new BadRequestException('INVALID_REPORT_ID');
    }

    const report = await this.reportRepository.findOne({
      where: { consultation: { id: consultationId } },
    });

    return this.reportRepository.update(report.id, editReportInfoDTO);
  }

  async deleteReportInfo(consultationId: number) {
    const isReport = await this.matchReportById(consultationId);
    if (!isReport) {
      throw new BadRequestException('INVALID_REPORT_ID');
    }

    const report = await this.reportRepository.findOne({
      where: { consultation: { id: consultationId } },
    });

    return this.reportRepository.delete(report.id);
  }

  async getReportInfo(consultationId: number) {
    const isReport = await this.matchReportById(consultationId);
    if (!isReport) {
      throw new BadRequestException('INVALID_REPORT_ID');
    }
    return this.reportRepository.findOne({
      where: { consultation: { id: consultationId } },
    });
  }

  async getLawyerCasesList(id: number, filter: GetConsultationQueryDTO) {
    const lawyer = await this.getLawyer(id);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    const [cases, total] = await this.consultationService.getManyAndCountBy(
      'lawyer',
      id,
      filter,
      false,
    );

    const initialConsultationGroups: any = [];
    const consultationsGroups = cases.reduce((acc, _case) => {
      for (const timeslot of _case.timeslots) {
        if (acc.length) {
          const consultationItem = acc.filter(
            (consultation) => consultation.date === timeslot.date,
          )[0];

          if (!!consultationItem) {
            const ifConsultationNotInItem =
              !consultationItem.consultations.filter(
                (consultation) => consultation.id === _case.id,
              ).length;
            if (ifConsultationNotInItem) {
              consultationItem.consultations.push(
                this.toLawyerCasesDTO(_case, lawyer.user.timezone),
              );
            }
          } else {
            acc.push({
              date: timeslot.date,
              consultations: [
                this.toLawyerCasesDTO(_case, lawyer.user.timezone),
              ],
            });
          }
        } else {
          acc.push({
            date: timeslot.date,
            consultations: [this.toLawyerCasesDTO(_case, lawyer.user.timezone)],
          });
        }
      }
      return acc;
    }, initialConsultationGroups);

    return {
      total,
      consultationsGroups,
    };
  }

  async getLawyerCasesEvents(id: number, filter: GetConsultationQueryDTO) {
    const lawyer = await this.getLawyer(id);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    const [cases] = await this.consultationService.getManyAndCountBy(
      'lawyer',
      id,
      filter,
      false,
    );

    return cases.map((consultation) => {
      const startTimeslot = consultation.timeslots[0];
      const endTimeslot =
        consultation.timeslots[consultation.timeslots.length - 1];

      const start = `${startTimeslot.date}T${startTimeslot.startAt}:00`;
      const end = `${endTimeslot.date}T${endTimeslot.finishAt}:00`;

      return {
        id: consultation.id,
        start: start,
        end: end,
        customer: {
          id: consultation?.customer?.user?.id,
          firstName: consultation?.customer?.user?.firstName,
          lastName: consultation?.customer?.user?.lastName,
          email: consultation?.customer?.user?.email,
        },
        link: consultation.communicationChannel,
      };
    });
  }

  toLawyerCasesDTO(consultation: Consultation, timezone: string) {
    return {
      id: consultation.id,
      customer: {
        id: consultation.customer.id,
        fullName: `${consultation.customer.user.firstName || ''} ${
          consultation.customer.user.lastName || ''
        }`.trim(),
        email: consultation.customer.user.email,
        avatar: consultation.customer.user.photo || '',
      },
      status: consultation.status,
      conversationId: consultation.conversationId || null,
      timeslots: consultation.timeslots.map((timeslot) =>
        this.sheduleService.toLawyerTimeslot(timeslot, timeslot.date, timezone),
      ),
    };
  }

  async getPosts(lawyerId: number, filter: GetPostsQueryDTO) {
    const lawyer = await this.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');
    const now = new Date(),
      dateFormat = 'yyyy-MM-dd';
    const {
      date = format(subWeeks(now, 1), dateFormat),
      dateEnd = format(addDays(now, 1), dateFormat),
      status,
    } = filter;
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.lawyer', 'lawyer')
      .where('lawyer.id = :lawyerId', { lawyerId })
      .andWhere('post.createdAt >= :date AND post.createdAt < :dateEnd', {
        date,
        dateEnd,
      });

    if (Object.values(PostStatuses).includes(status)) {
      query.andWhere(`post.status = :status`, { status });
    }

    if (filter.limit) {
      query.take(filter.limit).skip(filter.limit * (filter.page - 1));
    }

    const [posts, total] = await query.getManyAndCount();
    return {
      total,
      posts: posts.map(this.toLawyerPostsDTO),
    };
  }

  toLawyerPostsDTO(post: Post) {
    return {
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      status: post.status,
      thumbnails: post.thumbnails,
    };
  }

  toLawyerPostDTO(post: Post) {
    return {
      id: post.id,
      title: post.title,
      tags: post.tags,
      content: post.content,
      status: post.status,
      thumbnails: post.thumbnails,
      createdAt: post.createdAt,
      enableComments: post.enableComments,
    };
  }

  async getPost(lawyerId: number, postId: number) {
    const lawyer = await this.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    const post = await this.postService.getUserPostById(lawyer.user.id, postId);
    if (!post) throw new BadRequestException('Post not found');

    return this.toLawyerPostDTO(post);
  }

  async createPost(body: CreatePostDTO) {
    const { lawyerId, title, content, enableComments, thumbnails, tags } = body;
    const lawyer = await this.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    const post = await this.postService.createPost({
      title,
      content,
      enableComments,
      thumbnails,
      tags,
      createdBy: lawyer.user,
    });
    return this.toLawyerPostDTO(post);
  }

  async updatePost(body: UpdatePostDTO) {
    const {
      lawyerId,
      postId,
      title,
      content,
      enableComments,
      thumbnails,
      tags,
    } = body;
    const lawyer = await this.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    return this.postService.updatePost({
      user: lawyer.user,
      postId,
      title,
      content,
      enableComments,
      tags,
      thumbnails,
    });
  }

  async deletePost(lawyerId: number, postId: number) {
    const lawyer = await this.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    return this.postService.deleteUserPostById(lawyer.user.id, postId);
  }

  private async getLawyerWithGeolocation(lawyer: Lawyer) {
    const consultationsCount =
      await this.consultationService.getLawyerConsultationsCount(lawyer.id);

    const { averageGrade, reviews } =
      await this.feedbackService.getLawyerFeedbacks(lawyer.id, {});

    return {
      id: lawyer.id,
      geolocation: lawyer.geolocation,
      totalReviews: reviews.length,
      averageGrade,
      consultationsCount,
    };
  }

  async getLawyersByGeolocation(
    getLawyersByGeolocationDTO: GetLawyersByGeolocationDTO,
  ) {
    const { country, city, filters, sortBy } = getLawyersByGeolocationDTO;

    let query = this.lawyerRepository
      .createQueryBuilder('lawyer')
      .leftJoinAndSelect('lawyer.geolocation', 'geolocation')
      .where('lawyer.city = :city', {
        city,
      })
      .andWhere('lawyer.country = :country', {
        country,
      });

    if (!!filters) {
      const { formattedFilters } = this.getFormattedFilters(filters);
      await this.validateFilters(formattedFilters);

      query = query
        .andWhere('"experienceTime" >= :start', {
          start: formattedFilters?.experienceTime?.start || 0,
        })
        .andWhere('"experienceTime" < :end', {
          end: formattedFilters?.experienceTime?.end || 1000,
        });
    }

    const [result, total] = await query
      .orderBy('lawyer.experienceTime', 'DESC')
      .getManyAndCount();

    const lawyersListWithGeolocation = [];
    for await (const lawyer of result) {
      lawyersListWithGeolocation.push(
        await this.getLawyerWithGeolocation(lawyer),
      );
    }

    switch (sortBy) {
      case Sorts.Popularity:
        lawyersListWithGeolocation.sort(
          (a, b) => b.totalReviews - a.totalReviews,
        );
        break;
      case Sorts.ConsultationsCount:
        lawyersListWithGeolocation.sort(
          (a, b) => b.consultationsCount - a.consultationsCount,
        );
        break;
      default:
        break;
    }

    return {
      lawyers: lawyersListWithGeolocation.map((lawyer) => ({
        id: lawyer.id,
        geolocation: lawyer.geolocation,
      })),
      total,
    };
  }

  async getCitiesByCountry(country: Countries): Promise<string[]> {
    const citiesRaw = await this.lawyerRepository
      .createQueryBuilder('lawyer')
      .where('lawyer.country = :country', { country })
      .select('LOWER(lawyer.city)')
      .distinct(true)
      .getRawMany();

    return citiesRaw.map((cityRaw) => cityRaw.lower);
  }

  async generateReport(
    lawyerId: number,
    getConsultationsFilters: GetConsultationQueryDTO,
  ): Promise<Buffer> {
    const [consultations] = await this.consultationService.getManyAndCountBy(
      'lawyer',
      lawyerId,
      getConsultationsFilters,
      true,
    );

    const reportData = consultations.map((consultation) => {
      const report = consultation.report || ({} as EditReportInfoDTO);
      const customerUser = consultation?.customer?.user || ({} as User);

      return {
        id: consultation.id,
        communicationChannel: consultation.communicationChannel,
        status: consultation.status,
        requestCreated: format(consultation.createdAt, 'hh:mm dd.MM.yyyy'),
        name:
          report.name ||
          `${customerUser.firstName || ''} ${customerUser.lastName || ''}`,
        email: customerUser.email,
        gender: report.gender,
        age: report.age,
        phoneNumber: report.phoneNumber || customerUser.phone,
        statusOfBenificiary: report.statusOfBenificiary,
        placeOfResidence: report.placeOfResidence,
        clientOther: report.clientOther,
        // date:
        lawService: report.lawService,
        caseOther: report.caseOther,
        typeOfAssistance: report.typeOfAssistance,
        placeOfConsultation: report.placeOfConsultation,
        amountOfConsultations: report.amountOfConsultations,
        moreDetails: report.moreDetails,
      };
    });

    const reportFields = [
      'id',
      'communicationChannel',
      'status',
      'requestCreated',
      'name',
      'email',
      'gender',
      'age',
      'phoneNumber',
      'statusOfBenificiary',
      'placeOfResidence',
      'clientOther',
      'lawService',
      'caseOther',
      'typeOfAssistance',
      'placeOfConsultation',
      'amountOfConsultations',
      'moreDetails',
    ];

    const specification = reportFields.reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          displayName: ReportLocales[key],
          ...columnStyles,
        },
      }),
      {},
    );

    try {
      return await excel.buildExport([
        {
          name: 'Report',
          specification,
          data: reportData,
        },
      ]);
    } catch (e) {
      throw new BadRequestException(e, 'ReportGenerationException');
    }
  }
}

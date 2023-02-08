import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Consultation } from './consultation.entity';
import { CreateConsultationRequestDTO } from './dto/create-consultation-request.dto';
import { LawyerService } from '../lawyer/lawyer.service';
import { CustomerService } from '../customer/customer.service';
import { ScheduleService } from '../schedule/schedule.service';
import { GetConsultaionDTO } from './dto/get-constultation.dto';
import { RequestStatuses } from './enums/request-statuses.enum';
import { RescheduleDTO } from './dto/reschedule.dto';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Feedback } from '../feedback/feedback.entity';
import { GetConsultationQueryDTO } from './dto/get-consultation-query.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ChatService } from '../chat/chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ConsultationService extends TypeOrmCrudService<Consultation> {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @Inject(forwardRef(() => LawyerService))
    private lawyerService: LawyerService,
    private scheduleService: ScheduleService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    private chatService: ChatService,
  ) {
    super(consultationRepository);
  }

  async approve(consultationId: number): Promise<void> {
    await this.updateConsultationStatus(consultationId, {
      status: RequestStatuses.SCHEDULED,
    });
  }

  async complete(consultationId: number): Promise<void> {
    await this.updateConsultationStatus(consultationId, {
      status: RequestStatuses.COMPLETED,
    });
  }

  async reject(consultationId: number): Promise<void> {
    await this.updateConsultationStatus(consultationId, {
      status: RequestStatuses.REJECTED,
    });
  }

  async reviewed(
    consultationId: number,
    feedbackId: number,
    customerId: number,
  ) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: { customer: true },
    });

    if (!feedback) throw new BadRequestException('FEEDBACK_NOT_FOUND');
    if (feedback.customer.id !== customerId)
      throw new BadRequestException('USER_IS_NOT_BELONGS_TO_FEEDBACK');
    const isUserBelongsToConsultation = await this.isUserBelongsToConsultation(
      consultationId,
      { customer: { id: customerId } },
    );
    if (!isUserBelongsToConsultation)
      throw new BadRequestException('USER_IS_NOT_BELONGS_TO_CONSULTATION');

    await this.updateConsultationStatus(consultationId, {
      status: RequestStatuses.REVIEWED,
      feedback: { id: feedbackId },
    });
  }

  async updateConsultationStatus(
    consultationId: number,
    body: QueryDeepPartialEntity<Consultation>,
  ): Promise<void> {
    const consultation = await this.getConsultation(consultationId);

    if (!consultation) throw new BadRequestException('CONSULTATION_NOT_FOUND');

    await this.consultationRepository.update(consultationId, body);
  }

  async getConsultation(id: number): Promise<Consultation | null> {
    return await this.consultationRepository.findOne({
      where: { id },
      relations: { lawyer: true, customer: true },
    });
  }

  async createRequest(
    createConsultationRequestDto: CreateConsultationRequestDTO,
  ): Promise<GetConsultaionDTO> {
    const {
      customerId,
      lawyerId,
      communicationChannel,
      date,
      startAt,
      finishAt,
      timezone,
    } = createConsultationRequestDto;
    const customer = await this.customerService.findCustomer(customerId);
    if (!customer) throw new BadRequestException('Customer not found');
    const lawyer = await this.lawyerService.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    const timeslot = await this.scheduleService.createTimeSlot({
      lawyer,
      date,
      startAt: this.scheduleService.toUtcTime(date, startAt, timezone),
      finishAt: this.scheduleService.toUtcTime(date, finishAt, timezone),
      timezone,
    });

    const entityLike = {
      communicationChannel,
      customer,
      lawyer,
      timeslots: [timeslot],
    };

    let consultation = this.consultationRepository.create(entityLike);

    const conversationId = await this.chatService.getOrCreateConversation(
      {
        twilioIdentitySid: customer.user.twilioIdentitySid,
        twilioUserSid: customer.user.twilioUserSid,
      },
      {
        twilioIdentitySid: lawyer.user.twilioIdentitySid,
        twilioUserSid: lawyer.user.twilioUserSid,
      },
    );

    if (conversationId) {
      consultation.conversationId = conversationId;
    }

    consultation = await this.consultationRepository.save(consultation);
    consultation.timeslots[0].startAt = startAt;
    consultation.timeslots[0].finishAt = finishAt;
    return this.toConsultationData(consultation, timezone);
  }

  toConsultationData(
    consultation: Consultation,
    timezone: string,
  ): GetConsultaionDTO {
    const { id, status, lawyer, customer, communicationChannel, timeslots } =
      consultation;
    return {
      id,
      customerId: customer.id,
      lawyerId: lawyer.id,
      communicationChannel,
      timeslots: timeslots.map((slot) => ({
        date: slot.date,
        startAt: slot.startAt,
        finishAt: slot.finishAt,
        timezone,
      })),
      status,
    };
  }

  async getLawyerConsultationsCount(lawyerId: number) {
    return this.dataSource
      .getRepository(Consultation)
      .createQueryBuilder('consultation')
      .where('consultation."lawyerId" = :lawyerId', { lawyerId })
      .andWhere('consultation."status" = :status', {
        status: RequestStatuses.COMPLETED,
      })
      .getCount();
  }

  async reschedule(rescheduleDto: RescheduleDTO): Promise<boolean> {
    let { startAt, finishAt } = rescheduleDto;
    const { consultationId, date, timezone } = rescheduleDto;
    const consultation = await this.getConsultation(consultationId);
    if (!consultation) throw new BadRequestException('CONSULTATION_NOT_FOUND');

    startAt = this.scheduleService.toUtcTime(date, startAt, timezone);
    finishAt = this.scheduleService.toUtcTime(date, finishAt, timezone);

    await this.scheduleService.updateTimeSlot({
      lawyer: consultation.lawyer,
      consultation,
      date,
      startAt,
      finishAt,
      timezone,
    });
    await this.consultationRepository.update(consultationId, {
      status: RequestStatuses.PENDING,
    });

    return true;
  }

  async rejectOutdatedConsultation(
    rescheduleDto: RescheduleDTO,
  ): Promise<boolean> {
    const { startAt } = rescheduleDto;
    const { consultationId, date } = rescheduleDto;
    if (this.isPastDate(date, startAt, rescheduleDto.timezone)) {
      await this.consultationRepository.update(consultationId, {
        status: RequestStatuses.REJECTED,
      });
      throw new BadRequestException('PAST_DATE');
    }

    return false;
  }

  isPastDate(date: string, startAt: string, timezone: string): boolean {
    const now = new Date();
    const timeSlotTime = zonedTimeToUtc(`${date} ${startAt}:00`, timezone);

    if (timeSlotTime < now) return true;
    return false;
  }

  async isUserBelongsToConsultation(consultationId, extraWhere = {}) {
    return !!(await this.consultationRepository.findOne({
      where: { id: consultationId, ...extraWhere },
    }));
  }

  async getManyAndCountBy(
    role: 'customer' | 'lawyer',
    id: number,
    filter: GetConsultationQueryDTO,
    withReport: boolean,
  ) {
    const { date, dateEnd, status } = filter;

    let oppositeRole = 'customer';
    if (role === 'customer') oppositeRole = 'lawyer';

    const query = this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoinAndSelect(`consultation.${oppositeRole}`, oppositeRole)
      .leftJoinAndSelect(`${oppositeRole}.user`, 'user')
      .leftJoinAndSelect('consultation.timeslots', 'timeslots')
      .leftJoinAndSelect('consultation.feedback', 'feedback')
      .leftJoinAndMapOne(
        'consultation.conversation',
        'conversation',
        'conversation',
        '(conversation.user1Id = consultation.customerId AND conversation.user2Id = consultation.lawyerId OR conversation.user1Id = consultation.lawyerId AND conversation.user2Id = consultation.customerId)',
      )
      .where(`consultation.${role}Id = :id`, { id })
      .orderBy('consultation.updatedAt', 'DESC');

    if (withReport) {
      query.leftJoinAndSelect('consultation.report', 'report');
    }

    if (date && dateEnd) {
      query.andWhere('timeslots.date >= :date AND timeslots.date <= :dateEnd', {
        date,
        dateEnd,
      });
    }

    if (Object.values(RequestStatuses).includes(status)) {
      query.andWhere(`consultation.status = :status`, { status });
    }
    if (filter.limit) {
      query.take(filter.limit).skip(filter.limit * (filter.page - 1));
    }
    return query.getManyAndCount();
  }

  async sendMessageToLawyer(
    sendMessageDto: SendMessageDto,
    customerId: number,
  ): Promise<void> {
    const { lawyerId, message } = sendMessageDto;

    const customer = await this.customerService.findCustomer(customerId);
    if (!customer) throw new BadRequestException('Customer not found');
    const lawyer = await this.lawyerService.getLawyer(lawyerId);
    if (!lawyer) throw new BadRequestException('Lawyer not found');

    await this.chatService.sendMessageToLawyer(
      {
        twilioIdentitySid: customer.user.twilioIdentitySid,
        twilioUserSid: customer.user.twilioUserSid,
      },
      {
        twilioIdentitySid: lawyer.user.twilioIdentitySid,
        twilioUserSid: lawyer.user.twilioUserSid,
      },
      message,
    );
  }
}
